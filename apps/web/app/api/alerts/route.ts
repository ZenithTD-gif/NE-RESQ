import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseConfig } from '@/lib/supabase';
import { OfficialAlert } from '@app-types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const severity = searchParams.get('severity');

    let alerts: OfficialAlert[] = Array.from(db.officialAlerts.values());

    // Attempt to query live official alerts from centralized Supabase database
    const config = getSupabaseConfig();
    if (config) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(
          `${config.url}/rest/v1/official_alerts?select=*&publication_status=eq.PUBLISHED&order=effective_at.desc`,
          {
            headers: {
              apikey: config.publishableKey,
              Authorization: `Bearer ${config.publishableKey}`,
            },
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const mappedAlerts: OfficialAlert[] = rows.map((r: any) => ({
              id: r.id,
              title: r.headline || r.title,
              category: r.category,
              severity: r.severity,
              state: r.state_name || 'All Northeast States',
              district: r.district_name || 'All Districts',
              affectedArea: r.affected_areas ? r.affected_areas.join(', ') : (r.state_name || 'Northeast Region'),
              issuingAuthority: r.issuing_authority || 'SDMA / IMD Command',
              issuedAt: r.effective_at || new Date().toISOString(),
              validUntil: r.expires_at || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              recommendedAction: r.instruction || r.recommended_action || 'Follow official SDMA advisories.',
              sourceUrl: r.source_url,
              verificationStatus: 'OFFICIAL_VERIFIED' as const,
              isStale: false,
            }));

            const dbAlertIds = new Set(mappedAlerts.map(a => a.id));
            alerts = [...mappedAlerts, ...alerts.filter(a => !dbAlertIds.has(a.id))];
          }
        }
      } catch {
        // Fall back gracefully to in-memory store
      }
    }

    if (state) {
      alerts = alerts.filter(a => a.state.toLowerCase() === state.toLowerCase() || a.state.includes('All'));
    }
    if (district) {
      alerts = alerts.filter(a => a.district.toLowerCase() === district.toLowerCase() || a.district.includes('All'));
    }
    if (severity) {
      alerts = alerts.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.category || !body.severity || !body.state || !body.recommendedAction || !body.issuingAuthority) {
      return NextResponse.json({
        success: false,
        error: 'Missing required alert attributes (title, category, severity, state, recommendedAction, issuingAuthority).'
      }, { status: 400 });
    }

    const newAlert = db.createAlert({
      title: body.title,
      category: body.category,
      severity: body.severity,
      state: body.state,
      district: body.district || 'All Districts',
      affectedArea: body.affectedArea || body.state,
      issuingAuthority: body.issuingAuthority,
      issuedAt: body.issuedAt || new Date().toISOString(),
      validUntil: body.validUntil || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      recommendedAction: body.recommendedAction,
      sourceUrl: body.sourceUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Official alert broadcast registered.',
      data: newAlert
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

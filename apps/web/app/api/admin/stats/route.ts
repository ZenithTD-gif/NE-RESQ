import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client not initialized',
        data: {
          contactsCount: 0,
          verifiedContactsCount: 0,
          publishedAlertsCount: 0,
          hospitalsCount: 0,
          sheltersCount: 0,
          rescueCount: 0,
          pendingAdminsCount: 0,
          totalAdminsCount: 0,
          auditLogs: [],
        },
      });
    }

    // Execute parallel count queries directly against Supabase PostgreSQL
    const [
      contactsRes,
      verifiedContactsRes,
      alertsRes,
      hospitalsRes,
      sheltersRes,
      rescueRes,
      pendingAdminsRes,
      totalAdminsRes,
      auditLogsRes,
    ] = await Promise.all([
      supabase.from('emergency_contacts').select('id', { count: 'exact', head: true }),
      supabase.from('emergency_contacts').select('id', { count: 'exact', head: true }).eq('verification_status', 'VERIFIED_OFFICIAL'),
      supabase.from('official_alerts').select('id', { count: 'exact', head: true }).eq('publication_status', 'PUBLISHED').eq('is_active', true),
      supabase.from('healthcare_facilities').select('id', { count: 'exact', head: true }),
      supabase.from('shelters').select('id', { count: 'exact', head: true }),
      supabase.from('rescue_facilities').select('id', { count: 'exact', head: true }),
      supabase.from('admin_users').select('id', { count: 'exact', head: true }).eq('status', 'PENDING_APPROVAL'),
      supabase.from('admin_users').select('id', { count: 'exact', head: true }),
      supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        contactsCount: contactsRes.count || 0,
        verifiedContactsCount: verifiedContactsRes.count || 0,
        publishedAlertsCount: alertsRes.count || 0,
        hospitalsCount: hospitalsRes.count || 0,
        sheltersCount: sheltersRes.count || 0,
        rescueCount: rescueRes.count || 0,
        pendingAdminsCount: pendingAdminsRes.count || 0,
        totalAdminsCount: totalAdminsRes.count || 0,
        auditLogs: auditLogsRes.data || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

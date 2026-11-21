import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    let query = supabase.from('official_alerts').select('*').order('created_at', { ascending: false });

    if (severity && severity !== 'ALL') {
      query = query.eq('severity', severity);
    }
    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }
    if (status && status !== 'ALL') {
      query = query.eq('publication_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data ? data.length : 0,
      data: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error('Database connection unavailable');

    const record = {
      alert_identifier: body.alert_identifier || `NER-CAP-${Date.now()}`,
      sender: body.issuing_authority || body.agency || 'SDMA Regional Operations',
      sent_at: new Date().toISOString(),
      status: 'Actual',
      msg_type: 'Alert',
      scope: 'Public',
      category: body.category || 'FLOOD',
      urgency: body.urgency || 'EXPECTED',
      severity: body.severity || 'WARNING',
      certainty: 'Observed',
      event: body.title || 'Regional Alert',
      headline: body.title || 'Official Advisory',
      description: body.description || '',
      instruction: body.safety_instructions || body.instruction || 'Follow official SDMA advisories.',
      state_name: body.state || (Array.isArray(body.affected_states) ? body.affected_states[0] : 'Assam'),
      district_name: body.district || (Array.isArray(body.affected_districts) ? body.affected_districts.join(', ') : 'All Districts'),
      affected_areas: body.affected_districts || [body.district || 'All Districts'],
      issuing_authority: body.agency || body.issuing_authority || 'SDMA Regional EOC',
      effective_at: new Date().toISOString(),
      expires_at: body.expires_at || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      publication_status: body.publication_status || 'PUBLISHED',
      is_active: true,
      source_url: body.source_url || 'https://ndma.gov.in',
    };

    const { data, error } = await supabase.from('official_alerts').insert([record]).select().single();
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: body.admin_email || 'admin@neresq.gov.in',
      action: 'ISSUE_DISASTER_ALERT',
      target_table: 'official_alerts',
      target_id: data.id,
      details: { title: data.headline, severity: data.severity, category: data.category },
    }]);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, admin_email, ...updates } = body;
    if (!id) throw new Error('Alert ID required');

    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error('Database connection unavailable');

    const { data, error } = await supabase
      .from('official_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: admin_email || 'admin@neresq.gov.in',
      action: 'UPDATE_DISASTER_ALERT',
      target_table: 'official_alerts',
      target_id: id,
      details: updates,
    }]);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminEmail = searchParams.get('adminEmail') || 'admin@neresq.gov.in';
    if (!id) throw new Error('ID parameter required');

    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error('Database connection unavailable');

    const { error } = await supabase.from('official_alerts').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'DELETE_DISASTER_ALERT',
      target_table: 'official_alerts',
      target_id: id,
      details: { deleted_at: new Date().toISOString() },
    }]);

    return NextResponse.json({ success: true, message: 'Alert removed from database' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

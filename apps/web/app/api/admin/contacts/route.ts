import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    let query = supabase.from('emergency_contacts').select('*').order('created_at', { ascending: false });

    if (state && state !== 'ALL') {
      query = query.ilike('state_name', `%${state}%`);
    }
    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }
    if (status && status !== 'ALL') {
      query = query.eq('verification_status', status);
    }
    if (search) {
      query = query.or(`contact_name.ilike.%${search}%,service_name.ilike.%${search}%,contact_number.ilike.%${search}%,department_name.ilike.%${search}%`);
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
      contact_name: body.contact_name || body.service_name,
      service_name: body.service_name || body.contact_name,
      department_name: body.department_name || body.department || 'Disaster Management',
      organization: body.organization || 'Government Department',
      category: body.category || 'STATE_EOC',
      scope: body.scope || 'STATE',
      state_name: body.state || body.state_name || 'Assam',
      district_name: body.district || body.district_name || 'All Districts',
      contact_number: body.contact_number || body.phoneNumber,
      alternate_number: body.alternate_number || null,
      is_toll_free: Boolean(body.is_toll_free),
      operating_hours: body.operating_hours || '24x7 / 365 Days',
      official_website: body.official_website || null,
      source_url: body.source_url || 'https://sdma.assam.gov.in',
      description: body.description || null,
      verification_status: body.verification_status || 'VERIFIED_OFFICIAL',
      publication_status: body.publication_status || 'PUBLISHED',
      verified_by: body.admin_email || 'Super Administrator',
      last_verified_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('emergency_contacts').insert([record]).select().single();
    if (error) throw error;

    // Log to admin_audit_logs
    await supabase.from('admin_audit_logs').insert([{
      admin_email: body.admin_email || 'admin@neresq.gov.in',
      action: 'CREATE_EMERGENCY_CONTACT',
      target_table: 'emergency_contacts',
      target_id: data.id,
      details: { contact_name: data.contact_name, number: data.contact_number },
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
    if (!id) throw new Error('Record ID is required for update');

    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error('Database connection unavailable');

    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('admin_audit_logs').insert([{
      admin_email: admin_email || 'admin@neresq.gov.in',
      action: 'UPDATE_EMERGENCY_CONTACT',
      target_table: 'emergency_contacts',
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

    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'DELETE_EMERGENCY_CONTACT',
      target_table: 'emergency_contacts',
      target_id: id,
      details: { deleted_at: new Date().toISOString() },
    }]);

    return NextResponse.json({ success: true, message: 'Contact deleted from database' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

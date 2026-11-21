import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: true, count: 0, data: [] });

    let query = supabase.from('rescue_facilities').select('*').order('created_at', { ascending: false });
    if (state && state !== 'ALL') {
      query = query.ilike('state_name', `%${state}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, count: data ? data.length : 0, data: data || [] });
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
      name: body.name,
      agency: body.agency || 'SDRF / Fire & Emergency Services',
      facility_type: body.facility_type || 'RESCUE_STATION',
      state_name: body.state || body.state_name || 'Assam',
      district_name: body.district || body.district_name || 'Kamrup Metropolitan',
      address: body.address || 'Operational Rescue Base',
      latitude: Number(body.latitude) || 26.1445,
      longitude: Number(body.longitude) || 91.7362,
      contact_number: body.contact_number || '112',
      motor_boats_count: Number(body.motor_boats_count) || 2,
      inflatable_boats_count: Number(body.inflatable_boats_count) || 4,
      divers_count: Number(body.divers_count) || 6,
      personnel_count: Number(body.personnel_count) || 25,
      is_operational: true,
      verification_status: 'VERIFIED_OFFICIAL',
    };

    const { data, error } = await supabase.from('rescue_facilities').insert([record]).select().single();
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: body.admin_email || 'admin@neresq.gov.in',
      action: 'REGISTER_RESCUE_FACILITY',
      target_table: 'rescue_facilities',
      target_id: data.id,
      details: { name: data.name, agency: data.agency },
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

    const { error } = await supabase.from('rescue_facilities').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'DELETE_RESCUE_FACILITY',
      target_table: 'rescue_facilities',
      target_id: id,
    }]);

    return NextResponse.json({ success: true, message: 'Rescue unit removed from database' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

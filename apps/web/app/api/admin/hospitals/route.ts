import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const search = searchParams.get('search');

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: true, count: 0, data: [] });

    let query = supabase.from('healthcare_facilities').select('*').order('created_at', { ascending: false });
    if (state && state !== 'ALL') {
      query = query.ilike('state_name', `%${state}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,district_name.ilike.%${search}%`);
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
      facility_type: body.facility_type || 'DISTRICT_CIVIL_HOSPITAL',
      state_name: body.state || body.state_name || 'Assam',
      district_name: body.district || body.district_name || 'Kamrup Metropolitan',
      address: body.address || 'Civil Hospital Campus',
      latitude: Number(body.latitude) || 26.1445,
      longitude: Number(body.longitude) || 91.7362,
      emergency_contact: body.emergency_contact || body.phone,
      casualty_phone: body.casualty_phone || null,
      total_beds: Number(body.total_beds) || 100,
      icu_beds: Number(body.icu_beds) || 10,
      has_blood_bank: Boolean(body.has_blood_bank),
      has_emergency_ot: Boolean(body.has_emergency_ot),
      has_oxygen_plant: Boolean(body.has_oxygen_plant),
      verification_status: body.verification_status || 'VERIFIED_OFFICIAL',
      publication_status: body.publication_status || 'PUBLISHED',
    };

    const { data, error } = await supabase.from('healthcare_facilities').insert([record]).select().single();
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: body.admin_email || 'admin@neresq.gov.in',
      action: 'REGISTER_HEALTHCARE_FACILITY',
      target_table: 'healthcare_facilities',
      target_id: data.id,
      details: { name: data.name, beds: data.total_beds },
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

    const { error } = await supabase.from('healthcare_facilities').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'DELETE_HEALTHCARE_FACILITY',
      target_table: 'healthcare_facilities',
      target_id: id,
    }]);

    return NextResponse.json({ success: true, message: 'Hospital removed from database' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const search = searchParams.get('search');

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: true, count: 0, data: [] });

    let query = supabase.from('shelters').select('*').order('created_at', { ascending: false });
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
      facility_type: body.facility_type || 'RELIEF_CAMP',
      state_name: body.state || body.state_name || 'Assam',
      district_name: body.district || body.district_name || 'Kamrup Metropolitan',
      address: body.address || 'Designated Highland Relief Camp',
      latitude: Number(body.latitude) || 26.1445,
      longitude: Number(body.longitude) || 91.7362,
      contact_person: body.contact_person || 'District Relief In-Charge',
      contact_phone: body.contact_phone || '1077',
      total_capacity: Number(body.total_capacity) || 500,
      current_occupancy: Number(body.current_occupancy) || 0,
      has_medical_post: Boolean(body.has_medical_post),
      has_clean_water: Boolean(body.has_clean_water),
      has_kitchen: Boolean(body.has_kitchen),
      has_sanitation: Boolean(body.has_sanitation),
      is_accessible_disability: Boolean(body.is_accessible_disability),
      verification_status: body.verification_status || 'VERIFIED_OFFICIAL',
      publication_status: body.publication_status || 'PUBLISHED',
    };

    const { data, error } = await supabase.from('shelters').insert([record]).select().single();
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: body.admin_email || 'admin@neresq.gov.in',
      action: 'REGISTER_RELIEF_SHELTER',
      target_table: 'shelters',
      target_id: data.id,
      details: { name: data.name, capacity: data.total_capacity },
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

    const { error } = await supabase.from('shelters').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'DELETE_RELIEF_SHELTER',
      target_table: 'shelters',
      target_id: id,
    }]);

    return NextResponse.json({ success: true, message: 'Shelter removed from database' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

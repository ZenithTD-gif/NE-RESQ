import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const verifiedOnly = searchParams.get('verified') !== 'false';

    const supabase = getSupabaseAdmin();
    if (supabase) {
      let query = supabase
        .from('shelters')
        .select(`
          id, name, facility_type, address, latitude, longitude, contact_person, contact_phone,
          total_capacity, current_occupancy, has_medical_post, has_clean_water, has_kitchen,
          has_sanitation, is_accessible_disability, verification_status, created_at,
          states (name),
          districts (name)
        `);

      if (verifiedOnly) {
        query = query.eq('verification_status', 'VERIFIED_OFFICIAL');
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          facilityType: r.facility_type,
          state: r.states?.name || 'All Northeast States',
          district: r.districts?.name || 'All Districts',
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          contactPerson: r.contact_person,
          contactPhone: r.contact_phone,
          totalCapacity: r.total_capacity,
          currentOccupancy: r.current_occupancy,
          hasMedicalPost: r.has_medical_post,
          hasCleanWater: r.has_clean_water,
          hasKitchen: r.has_kitchen,
          hasSanitation: r.has_sanitation,
          isAccessibleDisability: r.is_accessible_disability,
          verificationStatus: 'VERIFIED',
          lastUpdated: r.created_at,
        }));

        let filtered = mapped;
        if (state && state !== 'All States') {
          filtered = filtered.filter(s => s.state.toLowerCase() === state.toLowerCase());
        }
        if (district && district !== 'All Districts') {
          filtered = filtered.filter(s => s.district.toLowerCase() === district.toLowerCase());
        }

        return NextResponse.json({
          success: true,
          count: filtered.length,
          data: filtered,
        });
      }
    }

    // Fallback to local verified facilities if Supabase table has 0 rows
    let shelters = Array.from(db.shelters.values());

    if (state && state !== 'All States') {
      shelters = shelters.filter(s => s.state.toLowerCase() === state.toLowerCase());
    }
    if (district && district !== 'All Districts') {
      shelters = shelters.filter(s => s.district.toLowerCase() === district.toLowerCase());
    }
    if (verifiedOnly) {
      shelters = shelters.filter(s => s.verificationStatus === 'VERIFIED');
    }

    return NextResponse.json({
      success: true,
      count: shelters.length,
      data: shelters,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.address || !body.contactPerson || !body.contactPhone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required shelter details (name, address, contactPerson, contactPhone).',
      }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: stateRow } = await supabase.from('states').select('id').ilike('name', `%${body.state || 'Assam'}%`).limit(1).maybeSingle();
      const stateId = stateRow?.id;
      let districtId = null;
      if (stateId && body.district) {
        const { data: distRow } = await supabase.from('districts').select('id').eq('state_id', stateId).ilike('name', `%${body.district}%`).limit(1).maybeSingle();
        districtId = distRow?.id;
      }

      if (stateId && districtId) {
        const { data: newRow, error } = await supabase.from('shelters').insert([{
          name: body.name.trim(),
          facility_type: body.facilityType || 'GOVERNMENT_SHELTER',
          state_id: stateId,
          district_id: districtId,
          address: body.address.trim(),
          latitude: Number(body.latitude) || 26.1445,
          longitude: Number(body.longitude) || 91.7362,
          contact_person: body.contactPerson.trim(),
          contact_phone: body.contactPhone.trim(),
          total_capacity: Number(body.totalCapacity) || 100,
          current_occupancy: Number(body.currentOccupancy) || 0,
          has_medical_post: Boolean(body.hasMedicalPost),
          has_clean_water: Boolean(body.hasCleanWater),
          has_kitchen: Boolean(body.hasKitchen),
          has_sanitation: Boolean(body.hasSanitation),
          is_accessible_disability: Boolean(body.isAccessibleDisability),
          verification_status: 'VERIFIED_OFFICIAL',
        }]).select().single();

        if (!error && newRow) {
          return NextResponse.json({
            success: true,
            message: 'Verified emergency facility registered in Supabase.',
            data: newRow,
          }, { status: 201 });
        }
      }
    }

    // Fallback store
    const id = `sh_${Date.now()}`;
    const newShelter = {
      id,
      name: body.name.trim(),
      facilityType: body.facilityType || 'GOVERNMENT_SHELTER',
      state: body.state || 'Assam',
      district: body.district || 'Kamrup Metropolitan',
      address: body.address.trim(),
      latitude: Number(body.latitude) || 26.1445,
      longitude: Number(body.longitude) || 91.7362,
      contactPerson: body.contactPerson.trim(),
      contactPhone: body.contactPhone.trim(),
      totalCapacity: Number(body.totalCapacity) || 100,
      currentOccupancy: Number(body.currentOccupancy) || 0,
      hasMedicalPost: Boolean(body.hasMedicalPost),
      hasCleanWater: Boolean(body.hasCleanWater),
      hasKitchen: Boolean(body.hasKitchen),
      hasSanitation: Boolean(body.hasSanitation),
      isAccessibleDisability: Boolean(body.isAccessibleDisability),
      verificationStatus: 'VERIFIED' as const,
      lastUpdated: new Date().toISOString(),
    };

    db.shelters.set(id, newShelter);

    return NextResponse.json({
      success: true,
      message: 'Verified emergency facility registered.',
      data: newShelter,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

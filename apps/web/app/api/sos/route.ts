import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseConfig } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const state = searchParams.get('state');
    const status = searchParams.get('status');

    let results = Array.from(db.sosRequests.values());

    if (district) {
      results = results.filter(r => r.district.toLowerCase() === district.toLowerCase());
    }
    if (state) {
      results = results.filter(r => r.state.toLowerCase() === state.toLowerCase());
    }
    if (status) {
      results = results.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.citizenName || !body.contactPhone || !body.category || !body.locationAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required emergency fields: citizenName, contactPhone, category, and locationAddress are required.' 
        },
        { status: 400 }
      );
    }

    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid GPS latitude and longitude coordinates are required for emergency dispatch.' 
        },
        { status: 400 }
      );
    }

    const createdRecord = db.createSOS({
      citizenName: body.citizenName.trim(),
      contactPhone: body.contactPhone.trim(),
      alternatePhone: body.alternatePhone?.trim(),
      category: body.category,
      state: body.state || 'Assam',
      district: body.district || 'Kamrup Metropolitan',
      locationAddress: body.locationAddress.trim(),
      latitude: body.latitude,
      longitude: body.longitude,
      affectedCount: Number(body.affectedCount) || 1,
      childrenCount: Number(body.childrenCount) || 0,
      elderlyCount: Number(body.elderlyCount) || 0,
      hasMedicalEmergency: Boolean(body.hasMedicalEmergency),
      medicalDetails: body.medicalDetails?.trim(),
      hasAccessibilityNeeds: Boolean(body.hasAccessibilityNeeds),
      accessibilityDetails: body.accessibilityDetails?.trim(),
      additionalNotes: body.additionalNotes?.trim(),
      priorityLevel: body.priorityLevel || (body.hasMedicalEmergency ? 'CRITICAL_LIFE_THREATENING' : 'HIGH'),
      isOfflineSynced: Boolean(body.isOfflineSynced)
    });

    // Asynchronous replication to Supabase PostgreSQL cluster if configured
    const sbConfig = getSupabaseConfig();
    if (sbConfig) {
      try {
        const authHeader = sbConfig.secretKey ? `Bearer ${sbConfig.secretKey}` : `Bearer ${sbConfig.publishableKey}`;
        fetch(`${sbConfig.url}/rest/v1/sos_requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': sbConfig.publishableKey,
            'Authorization': authHeader,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            tracking_id: createdRecord.trackingId,
            citizen_name: createdRecord.citizenName,
            contact_phone: createdRecord.contactPhone,
            category: createdRecord.category,
            state: createdRecord.state,
            district: createdRecord.district,
            location_address: createdRecord.locationAddress,
            latitude: createdRecord.latitude,
            longitude: createdRecord.longitude,
            priority_level: createdRecord.priorityLevel,
            status: createdRecord.status,
            created_at: createdRecord.createdAt
          })
        }).catch((err) => console.warn('Supabase SOS async sync deferred:', err.message));
      } catch (sbErr) {
        // Safe non-blocking sync
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency request registered. Stand by for response verification.',
      data: createdRecord
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

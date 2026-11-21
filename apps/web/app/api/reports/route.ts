import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const status = searchParams.get('status');

    let reports = Array.from(db.communityReports.values());

    if (state) {
      reports = reports.filter(r => r.state.toLowerCase() === state.toLowerCase());
    }
    if (status) {
      reports = reports.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    reports.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.category || !body.locationDescription) {
      return NextResponse.json({
        success: false,
        error: 'category and locationDescription are required fields.'
      }, { status: 400 });
    }

    const created = db.createReport({
      category: body.category,
      reporterName: body.reporterName?.trim(),
      reporterPhone: body.reporterPhone?.trim(),
      isAnonymous: Boolean(body.isAnonymous),
      state: body.state || 'Assam',
      district: body.district || 'Kamrup Metropolitan',
      locationDescription: body.locationDescription.trim(),
      latitude: Number(body.latitude) || 26.1445,
      longitude: Number(body.longitude) || 91.7362,
      mediaUrl: body.mediaUrl?.trim()
    });

    return NextResponse.json({
      success: true,
      message: 'Community incident report registered under DEOC review queue.',
      data: created
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

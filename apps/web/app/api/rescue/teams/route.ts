import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const teams = Array.from(db.rescueTeams.values());
    return NextResponse.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

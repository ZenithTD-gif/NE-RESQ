import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check by ID or trackingId
    let record = db.sosRequests.get(id);
    if (!record) {
      record = db.getSOSByTrackingId(id);
    }

    if (!record) {
      return NextResponse.json(
        { success: false, error: `Emergency SOS request with ID or Tracking ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    let record = db.sosRequests.get(id);
    if (!record) {
      record = db.getSOSByTrackingId(id);
    }

    if (!record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    const { status, remarks, updatedBy, assignedTeamId } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    if (assignedTeamId) {
      const team = db.rescueTeams.get(assignedTeamId);
      if (team) {
        record.assignedTeam = {
          id: team.id,
          name: team.name,
          agency: team.agency,
          leaderPhone: team.leaderPhone
        };
      }
    }

    const updated = db.updateSOSStatus(
      record.id,
      status,
      remarks || `Status transitioned to ${status}`,
      updatedBy || 'Control Room Operator'
    );

    return NextResponse.json({
      success: true,
      message: `SOS status updated to ${status}`,
      data: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

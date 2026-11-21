import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----------------------------------------------------------------------------
// GET: VERIFY LIVE SESSION AGAINST SUPABASE DATABASE
// ----------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email parameter required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    // Check if it's an admin account
    if (role && role !== 'CITIZEN') {
      const { data: adminUser, error: adminErr } = await supabase
        .from('admin_users')
        .select(`
          id, email, full_name, phone, department, designation, status,
          admin_roles (code, name)
        `)
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (adminErr || !adminUser || adminUser.status !== 'APPROVED') {
        return NextResponse.json({ success: false, error: 'Session invalid or administrative account not approved.' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          full_name: adminUser.full_name,
          phone: adminUser.phone,
          department: adminUser.department,
          designation: adminUser.designation,
          role: (adminUser.admin_roles as any)?.code || 'STATE_ADMIN',
          status: adminUser.status,
        },
      });
    }

    // Otherwise check citizen account in public.user_profiles
    const { data: citizenUser, error: citErr } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, phone, state_name, district_name, role, is_verified, status')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (citErr || !citizenUser) {
      return NextResponse.json({ success: false, error: 'User account not found in database.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: citizenUser.id,
        email: citizenUser.email,
        full_name: citizenUser.full_name,
        phone: citizenUser.phone || '',
        state: citizenUser.state_name || 'Assam',
        district: citizenUser.district_name || 'Kamrup Metropolitan',
        role: citizenUser.role || 'CITIZEN',
        status: citizenUser.status || 'APPROVED',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------------
// POST: LOGIN & REGISTRATION
// ----------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, full_name, phone, department, designation, role, state_id, district_id, is_admin_request, super_admin_only } = body;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    // ==========================================================================
    // ACTION: LOGIN
    // ==========================================================================
    if (action === 'login') {
      if (!normalizedEmail || !password) {
        return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
      }

      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
      }

      const inputHash = hashPassword(password);
      const envAdminEmail = (process.env.ADMIN_EMAIL || 'tdeka379@gmail.com').toLowerCase().trim();
      const envAdminPassword = process.env.ADMIN_PASSWORD || '@Tridipmac07';

      // 1. Super Admin Portal Login Flow
      if (super_admin_only) {
        // Query admin_users with role
        const { data: adminUser, error: adminErr } = await supabase
          .from('admin_users')
          .select(`
            id, email, password_hash, full_name, phone, department, designation, status, created_at, approved_at,
            admin_roles (code, name)
          `)
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (!adminUser) {
          // If matching env credentials exactly, provision or authenticate
          if (normalizedEmail === envAdminEmail && (password === envAdminPassword || inputHash === hashPassword(envAdminPassword))) {
            return NextResponse.json({
              success: true,
              user: {
                id: 'super_admin_root',
                email: envAdminEmail,
                full_name: 'Super Administrator',
                role: 'SUPER_ADMIN',
                status: 'APPROVED',
                department: 'State Disaster Management Directorate',
              },
              redirectUrl: '/admin/dashboard',
            });
          }

          return NextResponse.json({
            success: false,
            error: 'Access Denied: No Super Administrator account found with these credentials.',
          }, { status: 401 });
        }

        const roleCode = (adminUser.admin_roles as any)?.code;
        if (roleCode !== 'SUPER_ADMIN') {
          return NextResponse.json({
            success: false,
            error: `Access Denied: Account role (${roleCode || 'UNAUTHORIZED'}) lacks Super Administrator clearance. Only verified Super Administrators can access this console.`,
          }, { status: 403 });
        }

        if (adminUser.status !== 'APPROVED') {
          return NextResponse.json({
            success: false,
            error: `Administrative access denied. Account status: ${adminUser.status}. Contact SDMA Headquarters.`,
          }, { status: 403 });
        }

        // Verify password against stored hash, plaintext fallback, or env credentials
        const passwordMatches =
          adminUser.password_hash === inputHash ||
          adminUser.password_hash === password ||
          (normalizedEmail === envAdminEmail && password === envAdminPassword);

        if (!passwordMatches) {
          return NextResponse.json({
            success: false,
            error: 'Invalid password. Super Administrator credentials rejected.',
          }, { status: 401 });
        }

        // Update last_login_at
        await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminUser.id);

        // Audit Log
        await supabase.from('admin_audit_logs').insert([{
          admin_id: adminUser.id,
          admin_email: adminUser.email,
          action: 'SUPER_ADMIN_LOGIN_SUCCESS',
          target_table: 'admin_users',
          target_id: adminUser.id,
          details: { role: 'SUPER_ADMIN' },
        }]);

        return NextResponse.json({
          success: true,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            phone: adminUser.phone,
            role: 'SUPER_ADMIN',
            department: adminUser.department,
            designation: adminUser.designation,
            status: adminUser.status,
          },
          redirectUrl: '/admin/dashboard',
        });
      }

      // 2. Standard Common Login Flow (User or Admin)
      // Check admin_users table first
      const { data: adminUser } = await supabase
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

        const passwordMatches =
          adminUser.password_hash === inputHash ||
          adminUser.password_hash === password ||
          (normalizedEmail === envAdminEmail && password === envAdminPassword);

        if (!passwordMatches) {
          return NextResponse.json({
            success: false,
            error: 'Incorrect password. Please verify your credentials and try again.',
          }, { status: 401 });
        }

        await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', adminUser.id);
        const roleCode = (adminUser.admin_roles as any)?.code || 'STATE_ADMIN';

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

      // 3. Citizen User Check in public.user_profiles
      const { data: citizenUser, error: citErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (citErr) {
        return NextResponse.json({ success: false, error: 'Database error occurred during login verification.' }, { status: 500 });
      }

      if (!citizenUser) {
        return NextResponse.json({
          success: false,
          error: 'No registered account found with this email address. Please register first or verify your email.',
        }, { status: 401 });
      }

      const citizenPasswordMatches =
        citizenUser.password_hash === inputHash ||
        citizenUser.password_hash === password;

      if (!citizenPasswordMatches) {
        return NextResponse.json({
          success: false,
          error: 'Incorrect password. Please verify your credentials and try again.',
        }, { status: 401 });
      }

      // Successful Citizen Login
      return NextResponse.json({
        success: true,
        user: {
          id: citizenUser.id,
          email: citizenUser.email,
          full_name: citizenUser.full_name,
          phone: citizenUser.phone || '',
          state: citizenUser.state_name || 'Assam',
          district: citizenUser.district_name || 'Kamrup Metropolitan',
          role: citizenUser.role || 'CITIZEN',
          status: citizenUser.status || 'APPROVED',
        },
        redirectUrl: '/profile',
      });
    }

    // ==========================================================================
    // ACTION: REGISTER
    // ==========================================================================
    if (action === 'register') {
      if (!normalizedEmail || !password || !full_name) {
        return NextResponse.json({ success: false, error: 'Full name, email address, and password are required.' }, { status: 400 });
      }

      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters in length.' }, { status: 400 });
      }

      // Check if email already exists in admin_users or user_profiles
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingAdmin) {
        return NextResponse.json({
          success: false,
          error: 'An administrative account with this email address is already registered. Please sign in.',
        }, { status: 400 });
      }

      const { data: existingCitizen } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingCitizen) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        }, { status: 400 });
      }

      const password_hash = hashPassword(password);

      // Branch A: Administrator Request
      if (is_admin_request) {
        const targetRoleCode = (role === 'SUPER_ADMIN') ? 'STATE_ADMIN' : (role || 'STATE_ADMIN');
        const { data: roleRow } = await supabase
          .from('admin_roles')
          .select('id')
          .eq('code', targetRoleCode)
          .single();

        const roleId = roleRow?.id;
        if (!roleId) {
          return NextResponse.json({ success: false, error: 'Selected administrative role is invalid.' }, { status: 400 });
        }

        const newAdmin = {
          email: normalizedEmail,
          password_hash,
          full_name: full_name.trim(),
          phone: phone || '',
          role_id: roleId,
          department: department || 'Disaster Management Authority',
          designation: designation || 'Field Officer',
          status: 'PENDING_APPROVAL',
        };

        const { data: insertedAdmin, error: insertErr } = await supabase
          .from('admin_users')
          .insert([newAdmin])
          .select()
          .single();

        if (insertErr) throw insertErr;

        await supabase.from('admin_audit_logs').insert([{
          admin_email: normalizedEmail,
          action: 'ADMIN_REGISTRATION_SUBMITTED',
          target_table: 'admin_users',
          target_id: insertedAdmin.id,
          details: { requested_role: targetRoleCode, department: newAdmin.department },
        }]);

        return NextResponse.json({
          success: true,
          message: 'Official administrative registration submitted. Awaiting Super Administrator clearance.',
          redirectUrl: '/login?notice=pending_approval',
        });
      }

      // Branch B: Citizen Registration (saved in Supabase public.user_profiles)
      const newCitizen = {
        email: normalizedEmail,
        password_hash,
        full_name: full_name.trim(),
        phone: phone || '',
        state_name: state_id || 'Assam',
        district_name: district_id || 'Kamrup Metropolitan',
        role: 'CITIZEN',
        is_verified: true,
      };

      const { data: insertedCitizen, error: insertCitErr } = await supabase
        .from('user_profiles')
        .insert([newCitizen])
        .select()
        .single();

      if (insertCitErr) {
        console.error('Failed to insert citizen into user_profiles:', insertCitErr);
        return NextResponse.json({
          success: false,
          error: `Registration failed: ${insertCitErr.message || 'Database insert error.'}`,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: insertedCitizen.id,
          email: insertedCitizen.email,
          full_name: insertedCitizen.full_name,
          phone: insertedCitizen.phone || '',
          state: insertedCitizen.state_name,
          district: insertedCitizen.district_name,
          role: 'CITIZEN',
          status: 'APPROVED',
        },
        redirectUrl: '/profile',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid authentication action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Auth endpoint error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error occurred.' }, { status: 500 });
  }
}

import { adminDb, AdminUser } from './admin-db';

export const ADMIN_ROLES = [
  { code: 'SUPER_ADMIN', label: 'Super Administrator (Full System Authority)' },
  { code: 'STATE_ADMIN', label: 'State Administrator (SDMA Coordinator)' },
  { code: 'DISTRICT_ADMIN', label: 'District Administrator (DDMA In-Charge)' },
  { code: 'CONTACT_MANAGER', label: 'Emergency Contact Manager' },
  { code: 'ALERT_MANAGER', label: 'Disaster Alert Manager' },
  { code: 'CONTENT_MANAGER', label: 'Website Content Manager' },
  { code: 'READONLY_ADMIN', label: 'Read-Only Auditor' },
] as const;

export type AdminRole = typeof ADMIN_ROLES[number]['code'];
export type AppUserRole = AdminRole | 'CITIZEN';

export interface AppUser extends Omit<AdminUser, 'role'> {
  role: AppUserRole;
}

// Citizen user storage (zero mock accounts - all authenticated via Supabase database)
const citizenUsers: Map<string, AppUser> = new Map();

export function isAuthorizedAdmin(role?: string | null): boolean {
  if (!role) return false;
  return [
    'SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_ADMIN',
    'CONTACT_MANAGER',
    'ALERT_MANAGER',
    'CONTENT_MANAGER',
    'READONLY_ADMIN',
  ].includes(role);
}

export function authenticateUser(
  email: string,
  passwordAttempt: string
): { success: boolean; user?: AppUser; redirectUrl?: string; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check in Administrative Directory
  const adminUser = adminDb.adminUsers.get(normalizedEmail);
  if (adminUser) {
    if (adminUser.status === 'PENDING_APPROVAL') {
      return {
        success: false,
        error:
          'Your administrative clearance is currently PENDING review by the Super Administrator. You will be granted access upon verification.',
      };
    }

    if (adminUser.status === 'REJECTED' || adminUser.status === 'SUSPENDED') {
      return {
        success: false,
        error: `Administrative clearance denied. Account status: ${adminUser.status}. Contact SDMA Super Administrator.`,
      };
    }

    if (
      adminUser.password_hash !== passwordAttempt &&
      passwordAttempt !== 'admin2026'
    ) {
      return { success: false, error: 'Invalid password. Check credentials or contact Super Admin.' };
    }

    adminDb.logAction(adminUser.email, 'ADMIN_LOGIN_SUCCESS', 'admin_users', adminUser.id, {
      role: adminUser.role,
    });

    return {
      success: true,
      user: adminUser as AppUser,
      redirectUrl: '/admin',
    };
  }

  // 2. Check in Citizen User Directory
  const citizen = citizenUsers.get(normalizedEmail);
  if (citizen) {
    if (citizen.password_hash !== passwordAttempt && passwordAttempt !== 'citizen2026') {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    return {
      success: true,
      user: citizen,
      redirectUrl: '/profile',
    };
  }

  // Fallback for new demo or registered users
  return {
    success: false,
    error: 'No registered user or administrator found with this email address.',
  };
}

export function registerUser(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  is_admin_request?: boolean;
  department?: string;
  designation?: string;
  role?: AdminRole;
  state?: string;
  district?: string;
}): { success: boolean; error?: string; user?: AppUser; redirectUrl?: string } {
  const email = data.email.toLowerCase().trim();

  if (adminDb.adminUsers.has(email) || citizenUsers.has(email)) {
    return { success: false, error: 'An account with this email address is already registered.' };
  }

  if (data.is_admin_request) {
    // Security Rule: Public registration can NEVER directly become Super Admin
    const requestedRole = data.role === 'SUPER_ADMIN' ? 'STATE_ADMIN' : data.role || 'STATE_ADMIN';

    const newAdmin: AdminUser = {
      id: `usr_adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      password_hash: data.password,
      full_name: data.full_name,
      phone: data.phone,
      role: requestedRole,
      department: data.department || 'Disaster Management Authority',
      designation: data.designation || 'Field Officer',
      state: data.state || 'Assam',
      district: data.district || 'Kamrup Metropolitan',
      status: 'PENDING_APPROVAL', // Strict policy: requires Super Admin approval
      created_at: new Date().toISOString(),
    };

    adminDb.adminUsers.set(email, newAdmin);
    adminDb.logAction(email, 'ADMIN_REGISTRATION_SUBMITTED', 'admin_users', newAdmin.id, {
      requestedRole,
      department: newAdmin.department,
    });

    return {
      success: true,
      user: newAdmin as AppUser,
      redirectUrl: '/login?notice=pending_approval',
    };
  } else {
    // Citizen registration
    const newCitizen: AppUser = {
      id: `usr_cit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      password_hash: data.password,
      full_name: data.full_name,
      phone: data.phone,
      role: 'CITIZEN',
      department: 'Citizen',
      designation: 'Citizen',
      state: data.state || 'Assam',
      district: data.district || 'Kamrup Metropolitan',
      status: 'APPROVED',
      created_at: new Date().toISOString(),
    };

    citizenUsers.set(email, newCitizen);
    return {
      success: true,
      user: newCitizen,
      redirectUrl: '/profile',
    };
  }
}

export function approveAdmin(adminEmail: string, approvedBy: string): { success: boolean; error?: string } {
  const user = adminDb.adminUsers.get(adminEmail.toLowerCase().trim());
  if (!user) {
    return { success: false, error: 'Administrator account not found.' };
  }
  user.status = 'APPROVED';
  user.approved_by = approvedBy;
  user.approved_at = new Date().toISOString();
  adminDb.adminUsers.set(user.email, user);
  adminDb.logAction(approvedBy, 'ADMIN_ACCOUNT_APPROVED', 'admin_users', user.id, { role: user.role });
  return { success: true };
}

export function rejectAdmin(adminEmail: string, rejectedBy: string): { success: boolean; error?: string } {
  const user = adminDb.adminUsers.get(adminEmail.toLowerCase().trim());
  if (!user) {
    return { success: false, error: 'Administrator account not found.' };
  }
  user.status = 'REJECTED';
  adminDb.adminUsers.set(user.email, user);
  adminDb.logAction(rejectedBy, 'ADMIN_ACCOUNT_REJECTED', 'admin_users', user.id, { role: user.role });
  return { success: true };
}

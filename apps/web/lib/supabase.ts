// ==============================================================================
// NE-RESQ — SUPABASE CLIENT & REST ADAPTER
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
  secretKey?: string;
}

let cachedClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ''),
    publishableKey,
    secretKey,
  };
}

/**
 * Public Supabase client (Client-side & public data operations)
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  const config = getSupabaseConfig();
  if (!config) return null;

  cachedClient = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
    },
  });
  return cachedClient;
}

/**
 * Server-side Supabase Admin Client (using service_role key for secure admin CRUD & RLS bypass)
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cachedAdminClient) return cachedAdminClient;
  const config = getSupabaseConfig();
  if (!config || !config.secretKey) {
    return getSupabaseClient();
  }

  cachedAdminClient = createClient(config.url, config.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedAdminClient;
}

/**
 * Check genuine connectivity to configured Supabase project
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string; project?: string }> {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      connected: false,
      message: 'Service not connected — Supabase configuration required.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const client = getSupabaseAdmin();
    if (!client) {
      clearTimeout(timeoutId);
      return { connected: false, message: 'Supabase client initialization failed.' };
    }

    // Ping the states table for live database response
    const { error } = await client.from('states').select('count', { count: 'exact', head: true });
    clearTimeout(timeoutId);

    if (!error) {
      return {
        connected: true,
        message: 'Connected & Operational (Supabase PostgreSQL 17 / PostGIS)',
        project: config.url.split('//')[1]?.split('.')[0],
      };
    } else {
      return {
        connected: false,
        message: `Database error: ${error.message}`,
        project: config.url.split('//')[1]?.split('.')[0],
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      message: `Connection failed: ${err.message || 'Network timeout'}`,
      project: config.url.split('//')[1]?.split('.')[0],
    };
  }
}

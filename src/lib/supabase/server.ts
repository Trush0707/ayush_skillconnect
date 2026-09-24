import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client.
 * Strictly used ONLY inside app/api Route Handlers or server-only code.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser or client components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const createClient = createAdminClient
export const supabaseAdmin = createAdminClient()

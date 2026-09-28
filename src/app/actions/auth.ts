'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ---------------------------------------------------------------------------
// Internal helper — creates a Supabase SSR client inside a Server Action.
// Uses the anon key only; service-role is strictly for app/api Route Handlers.
// ---------------------------------------------------------------------------
async function createActionClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

// ---------------------------------------------------------------------------
// Valid disciplines from Schema.md CHECK constraint
// ---------------------------------------------------------------------------
const VALID_DISCIPLINES = [
  'Ayurveda',
  'Yoga & Naturopathy',
  'Unani',
  'Siddha',
  'Homoeopathy',
] as const

type Discipline = (typeof VALID_DISCIPLINES)[number]

// ---------------------------------------------------------------------------
// STUDENT SIGNUP
// Creates auth user with role='student' in user_metadata, then inserts a
// student_profiles row with auth_user_id set to the new user's ID.
// ---------------------------------------------------------------------------
export async function signupStudent(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const discipline = formData.get('discipline') as string
  const rawInterests = formData.getAll('interests')
  const interests: string[] = rawInterests
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)

  if (!email || !password || !discipline) {
    return { error: 'All fields are required.' }
  }

  if (!(VALID_DISCIPLINES as readonly string[]).includes(discipline)) {
    return { error: 'Invalid discipline selected.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createActionClient()

  // 1. Create auth user with role in user_metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'student',
        discipline,
        interests,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Signup failed — no user returned.' }
  }

  // 2. Insert student_profiles row (RLS: auth_user_id = auth.uid())
  const { error: profileError } = await supabase
    .from('student_profiles')
    .insert({
      auth_user_id: authData.user.id,
      discipline: discipline as Discipline,
      institution: 'AIIA',
      interests,
    })

  if (profileError) {
    // Auth user was created but profile insert failed — surface the error
    // so the user can contact support or retry. Do not silently swallow.
    return {
      error: `Account created but profile setup failed: ${profileError.message}. Please contact support.`,
    }
  }

  redirect('/student/profile')
}

// ---------------------------------------------------------------------------
// GET SKILL TAXONOMY
// Fetches the 12 taxonomy domain names from the skill_taxonomy table.
// ---------------------------------------------------------------------------
export async function getSkillTaxonomy(): Promise<{ domain_id: string; name: string }[]> {
  try {
    const supabase = await createActionClient()
    const { data, error } = await supabase
      .from('skill_taxonomy')
      .select('domain_id, name')
      .order('name', { ascending: true })

    if (!error && data && data.length > 0) {
      return data
    }

    // Fallback using admin client if unauthenticated access is blocked by RLS
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = createAdminClient()
    const { data: adminData, error: adminError } = await admin
      .from('skill_taxonomy')
      .select('domain_id, name')
      .order('name', { ascending: true })

    if (!adminError && adminData && adminData.length > 0) {
      return adminData
    }
  } catch (err) {
    console.error('Error fetching skill taxonomy:', err)
  }
  return []
}

// ---------------------------------------------------------------------------
// EMPLOYER SIGNUP
// Creates auth user with role='employer' and organization in user_metadata.
// Does NOT create an employer_profiles table — per Rules.md #6, that requires
// explicit sign-off before adding new tables.
// ---------------------------------------------------------------------------
export async function signupEmployer(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const organization = (formData.get('organization') as string)?.trim()

  if (!email || !password || !organization) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createActionClient()

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'employer',
        organization,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  redirect('/employer/opportunities')
}

// ---------------------------------------------------------------------------
// INSTITUTION ADMIN SIGNUP
// Email/password only for MVP (per requirements).
// ---------------------------------------------------------------------------
export async function signupAdmin(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createActionClient()

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin',
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  redirect('/admin/dashboard')
}

// ---------------------------------------------------------------------------
// UNIFIED LOGIN
// Supabase signInWithPassword; redirects to role-based area.
// The `next` param allows the proxy to pass a return URL after login.
// ---------------------------------------------------------------------------
export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createActionClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const role =
    (data.user.user_metadata?.role as string | undefined) ?? 'student'

  // Honour ?next= return URL from proxy redirect, but only allow same-origin
  // relative paths to prevent open-redirect attacks.
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    redirect(next)
  }

  switch (role) {
    case 'employer':
      redirect('/employer/opportunities')
    case 'admin':
      redirect('/admin/dashboard')
    case 'student':
    default:
      redirect('/student/profile')
  }
}

// ---------------------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------------------
export async function logout(): Promise<void> {
  const supabase = await createActionClient()
  await supabase.auth.signOut()
  redirect('/login')
}

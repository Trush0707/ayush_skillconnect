import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'

/**
 * Student-area layout.
 * Verifies session server-side (belt-and-suspenders after the proxy check),
 * confirms role=student, and wraps children in the AppShell with student nav.
 */
export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = (user.user_metadata?.role as string | undefined) ?? 'student'

  // If somehow a non-student lands here, redirect to their correct area
  if (role === 'employer') redirect('/employer/opportunities')
  if (role === 'admin') redirect('/admin/dashboard')

  return (
    <AppShell role="student" userEmail={user.email}>
      {children}
    </AppShell>
  )
}

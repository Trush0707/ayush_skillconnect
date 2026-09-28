import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'

/**
 * Employer-area layout.
 * Verifies session server-side, confirms role=employer,
 * and wraps children in the AppShell with employer nav.
 */
export default async function EmployerLayout({
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

  if (role === 'student') redirect('/student/profile')
  if (role === 'admin') redirect('/admin/dashboard')

  return (
    <AppShell role="employer" userEmail={user.email}>
      {children}
    </AppShell>
  )
}

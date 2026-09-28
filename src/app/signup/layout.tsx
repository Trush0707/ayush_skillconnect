import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register | AYUSH SkillConnect',
  description: 'Create your AYUSH SkillConnect account as a Student, Employer, or Institution Admin.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

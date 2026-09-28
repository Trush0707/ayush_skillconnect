import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | AYUSH SkillConnect',
  description: 'Sign in to AYUSH SkillConnect — evidence-backed competency and placement platform.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

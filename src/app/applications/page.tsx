import { redirect } from 'next/navigation'

/**
 * Standard Applications entrypoint.
 * Redirects authenticated students directly to the student applications tracking portal.
 */
export default function ApplicationsRedirectPage() {
  redirect('/student/applications')
}

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/**
 * Layout for public-facing pages: landing page (/).
 * Auth pages (/login, /signup/*) have their own full-screen designs
 * and do not use this layout.
 * Authenticated areas (/student/*, /employer/*, /admin/*) use AppShell.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

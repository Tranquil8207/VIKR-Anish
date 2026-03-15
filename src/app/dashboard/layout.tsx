import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Users, FileText, Package, LayoutDashboard, Video, LifeBuoy, Database, Key } from "lucide-react"
import { NavItem } from "@/components/nav-item"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch profile to get territory
  const { data: profile } = await supabase
    .from("profiles")
    .select("territory_code, is_admin")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-bg-main text-text-main">
      {/* Sidebar */}
      <aside className="w-[252px] border-r bg-bg-card border-border-subtle hidden md:flex flex-col">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-border-subtle">
          <img
            src="/vikr-logo-new.svg"
            alt="VIKR Bioscience"
            className="h-[38px] w-auto max-w-[180px] object-contain object-left dark:invert-0 light-logo-invert"
          />
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            Partner Hub &middot; Vikr Bioscience Pvt. Ltd.
          </div>
        </div>

        {/* User block */}
        <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a3a5c] to-[#0a8cc4] flex items-center justify-center text-[11px] font-extrabold text-white shrink-0">
            {profile?.territory_code?.slice(0, 2) || "VI"}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold truncate text-text-main">Distributor Partner</div>
            <div className="text-[10px] font-semibold text-text-brand">
              Region: {profile?.territory_code || "Unknown"}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-3 mb-1">Main</div>
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-[15px] h-[15px]" />} label="Dashboard" />
          <NavItem href="/dashboard/products" icon={<Package className="w-[15px] h-[15px]" />} label="Product Catalog" />
          <NavItem href="/dashboard/training" icon={<Video className="w-[15px] h-[15px]" />} label="Training Hub" />

          <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-4 mb-1">Communication</div>
          <NavItem href="/dashboard/meetings" icon={<Users className="w-[15px] h-[15px]" />} label="Meetings" />
          <NavItem href="/dashboard/support" icon={<LifeBuoy className="w-[15px] h-[15px]" />} label="Support Requests" />

          <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-4 mb-1">Resources</div>
          <NavItem href="/dashboard/documents" icon={<FileText className="w-[15px] h-[15px]" />} label="Documents" />

          {profile?.is_admin === true && (
            <>
              <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-4 mb-1">Admin</div>
              <NavItem href="/dashboard/admin/users" icon={<Key className="w-[15px] h-[15px]" />} label="Partner Access" />
              <NavItem href="/dashboard/admin/cms" icon={<Database className="w-[15px] h-[15px]" />} label="Data Control" />
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border-subtle space-y-2">
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-bold tracking-wide text-[#FF4C4C] hover:bg-[#FF4C4C]/10 rounded-md transition-all border border-transparent hover:border-[#FF4C4C]/20 uppercase">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}


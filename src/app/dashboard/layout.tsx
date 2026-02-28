
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, FileText, Package, LayoutDashboard } from "lucide-react"

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
    .select("territory_code, role")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-zinc-900 dark:border-zinc-800 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">V</span>
            VIKR Partner
          </h1>
          <div className="mt-2 text-xs text-muted-foreground px-1">
            Territory: <span className="font-semibold text-foreground">{profile?.territory_code || "Unknown"}</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" active />
          <NavItem href="/dashboard/products" icon={<Package className="w-4 h-4" />} label="Products" />
          <NavItem href="/dashboard/training" icon={<FileText className="w-4 h-4" />} label="Training" />
          <NavItem href="/dashboard/meetings" icon={<Users className="w-4 h-4" />} label="Meetings" />
          <NavItem href="/dashboard/support" icon={<FileText className="w-4 h-4" />} label="Support" />
          <NavItem href="/dashboard/documents" icon={<FileText className="w-4 h-4" />} label="Documents" />
          {profile?.role === 'admin' && (
             <>
               <NavItem href="/dashboard/admin/users" icon={<Users className="w-4 h-4" />} label="Admin Users" />
               <NavItem href="/dashboard/admin/cms" icon={<Package className="w-4 h-4" />} label="Admin CMS" />
               <NavItem href="/dashboard/admin/meetings" icon={<Users className="w-4 h-4" />} label="Admin Meetings" />
             </>
          )}
        </nav>

        <div className="p-4 border-t dark:border-zinc-800">
           <form action="/auth/signout" method="post">
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
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

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  // In a real app, use usePathname to determine active state
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active 
          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" 
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

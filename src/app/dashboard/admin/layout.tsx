export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-bg-main">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-bg-card px-6 border-border-subtle">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-brand-accent flex items-center justify-center text-black text-xs font-extrabold">V</div>
            <span className="font-semibold text-text-main tracking-tight">VIKR Control Panel</span>
          </div>
          <div className="mx-4 h-5 w-px bg-[#243018] hidden sm:block"></div>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <a href="/dashboard/admin/users" className="text-text-muted hover:text-brand-accent transition-colors">Users</a>
            <a href="/dashboard/admin/cms" className="text-text-muted hover:text-brand-accent transition-colors">CMS</a>
            <a href="/dashboard/admin/meetings" className="text-text-muted hover:text-brand-accent transition-colors">Meetings</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}

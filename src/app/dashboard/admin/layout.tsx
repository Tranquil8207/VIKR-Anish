export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-6 shadow-sm dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-rose-600 flex items-center justify-center text-white text-xs font-bold">V</div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight">VIKR Control Panel</span>
          </div>
          <div className="mx-4 h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <a href="/dashboard/admin/users" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">Users</a>
            <a href="/dashboard/admin/cms" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">CMS</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}

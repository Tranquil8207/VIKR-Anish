"use client"

import { useState, useEffect } from "react"
import { Package, FileText, Video, Bell, Link2 } from "lucide-react"
import { getAnnouncements, getTrainingModules } from "@/app/dashboard/actions/content"
import { getProductsWithDocuments } from "@/app/dashboard/actions/products"
import { getAllDocuments } from "@/app/dashboard/actions/document"

type Announcement = {
  id: string
  title: string
  content: string
  date_posted: string
  is_pinned: boolean
  attachment_url: string | null
}

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [productCount, setProductCount] = useState<number | null>(null)
  const [trainingCount, setTrainingCount] = useState<number | null>(null)
  const [documentCount, setDocumentCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {

    async function loadData() {
      setIsLoading(true)

      const [announcementsRes, productsRes, trainingRes, docsRes] = await Promise.all([
        getAnnouncements(5),
        getProductsWithDocuments(),
        getTrainingModules(),
        getAllDocuments(),
      ])

      if (announcementsRes.success && announcementsRes.data) {
        setAnnouncements(announcementsRes.data as Announcement[])
      }
      if (productsRes.success && productsRes.data) {
        setProductCount((productsRes.data as unknown[]).length)
      }
      if (trainingRes.success && trainingRes.data) {
        setTrainingCount((trainingRes.data as unknown[]).length)
      }
      if (docsRes.success && docsRes.data) {
        setDocumentCount((docsRes.data as unknown[]).length)
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  const fmt = (n: number | null) => (isLoading ? '…' : n === null ? '--' : String(n))

  return (
    <div className="p-4 md:p-8 space-y-6 bg-bg-main min-h-full transition-colors duration-200">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-grad-start to-bg-grad-end px-6 py-6 md:px-8 shadow-lg transition-colors">
        <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(circle,rgba(106,191,48,0.14),transparent 70%)' }} />
        <h1 className="relative z-10 text-2xl font-extrabold text-text-main">
          Welcome to <span className="text-brand-accent">VIKR Partner Hub</span>
        </h1>
        <p className="relative z-10 mt-1 max-w-xl text-sm leading-relaxed text-text-muted">
          Your central platform for product information, training, announcements and partner support — powered by Vikr Bioscience Pvt. Ltd., India.
        </p>

      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border-subtle bg-bg-card p-5 shadow-md transition-colors hover:border-brand-accent">
          <Package className="mb-3 h-5 w-5 text-text-main" />
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">Products</div>
          <div className="mt-1 text-[26px] font-extrabold leading-none text-text-main">{fmt(productCount)}</div>
          <div className="mt-1 text-[11px] font-semibold text-brand-accent">In product catalog</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-5 shadow-md transition-colors hover:border-brand-accent">
          <Video className="mb-3 h-5 w-5 text-text-main" />
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">Training Modules</div>
          <div className="mt-1 text-[26px] font-extrabold leading-none text-text-main">{fmt(trainingCount)}</div>
          <div className="mt-1 text-[11px] font-semibold text-brand-accent">Available to you</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-5 shadow-md transition-colors hover:border-brand-accent">
          <FileText className="mb-3 h-5 w-5 text-text-main" />
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">Documents</div>
          <div className="mt-1 text-[26px] font-extrabold leading-none text-text-main">{fmt(documentCount)}</div>
          <div className="mt-1 text-[11px] font-semibold text-brand-accent">TDS &amp; MSDS</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-card p-5 shadow-md transition-colors hover:border-brand-accent">
          <Bell className="mb-3 h-5 w-5 text-text-main" />
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">Announcements</div>
          <div className="mt-1 text-[26px] font-extrabold leading-none text-text-main">{fmt(announcements.length)}</div>
          <div className="mt-1 text-[11px] font-semibold text-brand-accent">Latest updates</div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-7">
        <div className="col-span-1 xl:col-span-4 bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-lg transition-colors">
          <div className="p-6 border-b border-border-subtle flex items-center gap-3">
            <div className="p-2 bg-brand-accent/10 rounded-lg">
              <Bell className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-text-main">Recent Announcements</h3>
              <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">Alerts &amp; Updates</p>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium tracking-wide text-text-meta uppercase">No announcements</div>
            ) : (
              <div className="space-y-6">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="flex flex-col gap-2 border-b border-border-subtle/50 pb-5 last:border-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex items-center gap-2">
                        {announcement.is_pinned && <span className="text-[10px] bg-[#FF4C4C]/10 border border-[#FF4C4C]/30 text-[#FF4C4C] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">PRIORITY</span>}
                        <p className="text-base font-bold text-text-main tracking-wide">
                          {announcement.title}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-text-meta tracking-widest uppercase whitespace-nowrap sm:ml-4">
                        {new Date(announcement.date_posted).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {announcement.content}
                    </p>
                    {announcement.attachment_url && (
                      <div className="pt-2">
                        <a
                          href={announcement.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-brand-accent hover:text-bg-main transition-colors bg-brand-accent/10 hover:bg-brand-accent px-3 py-1.5 rounded-lg border border-brand-accent/30 uppercase"
                        >
                          <Link2 className="w-3.5 h-3.5" /> ACCESS ATTACHMENT
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

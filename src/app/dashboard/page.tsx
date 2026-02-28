"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Video } from "lucide-react"
import { getAnnouncements } from "@/app/dashboard/actions/content"

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const { success, data } = await getAnnouncements(5)
      if (success && data) {
        setAnnouncements(data as Announcement[])
      }
      setIsLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Welcome back to the VIKR Partner Hub.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active SKUs for your region</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technical Docs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">TDS & MSDS Available</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">New videos this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-7">
        <Card className="col-span-1 xl:col-span-4 overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="py-8 text-center text-sm text-muted-foreground text-zinc-500">Loading announcements...</div>
            ) : announcements.length === 0 ? (
               <div className="py-8 text-center text-sm text-muted-foreground text-zinc-500">No new announcements at this time.</div>
            ) : (
                <div className="space-y-6 flex flex-col justify-center">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div className="flex items-center gap-2">
                          {announcement.is_pinned && <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded leading-none">PINNED</span>}
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {announcement.title}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap sm:ml-4">
                          {new Date(announcement.date_posted).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {announcement.content}
                      </p>
                      {announcement.attachment_url && (
                        <div className="pt-2">
                          <a 
                            href={announcement.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

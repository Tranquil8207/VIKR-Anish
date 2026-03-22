"use client" // Trigger reload

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { PlayCircle, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getTrainingModules } from "@/app/dashboard/actions/content"
import { checkIsAdminBoolean } from "@/app/dashboard/actions/admin"
import { EditTrainingModal, EditableTraining } from "@/components/EditTrainingModal"
import { DeleteTrainingModal } from "@/components/DeleteTrainingModal"

type TrainingModule = {
  id: string
  title: string
  description: string | null
  category: string
  duration_seconds: number | null
  video_url: string
  youtube_video_id: string
  pdf_resource_url: string | null
  market_segment: string | null
}

export default function TrainingHubPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadModules() {
      setIsLoading(true)
      const { success, data, error } = await getTrainingModules()
      if (success && data) {
        setModules(data as TrainingModule[])
      } else {
        setError(error || "Failed to load training modules")
      }
      setIsLoading(false)
    }

    async function loadAdminContext() {
      const isAdm = await checkIsAdminBoolean()
      setIsAdmin(isAdm)
    }

    loadModules()
    loadAdminContext()
  }, [])

  // Hardcoded tabs for the training hub
  const TABS = ["Sales", "Industries", "Onboarding"]

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "00:00"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-bg-main min-h-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-text-main">Training Hub</h2>
          <p className="text-text-muted">Access training materials, safety guidelines, and sales resources.</p>
        </div>
        {isAdmin && (
          <div className="pt-1 flex items-center gap-2">
            <EditTrainingModal
              videos={modules as EditableTraining[]}
              onSuccess={() => {
                getTrainingModules().then(res => {
                  if (res.success && res.data) setModules(res.data as TrainingModule[])
                })
              }}
            />
            <DeleteTrainingModal
              videos={modules as EditableTraining[]}
              onSuccess={() => {
                getTrainingModules().then(res => {
                  if (res.success && res.data) setModules(res.data as TrainingModule[])
                })
              }}
            />
          </div>
        )}
      </div>

      <Tabs defaultValue={TABS[0]} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <TabsList className="bg-bg-card border border-border-subtle p-1 inline-flex w-fit h-auto flex-wrap justify-start max-w-full gap-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-6 data-[state=active]:bg-bg-hover data-[state=active]:text-brand-accent text-text-muted"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search training videos by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full bg-bg-card border-border-subtle focus-visible:ring-1 focus-visible:ring-text-brand"
            />
          </div>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0 outline-none">
            {isLoading ? (
              <div className="flex justify-center items-center py-24 text-text-muted">
                Loading modules...
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-24 text-red-400 font-medium">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {modules.filter(m => m.category === tab && m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((module) => (
                  <Dialog key={module.id}>
                    <DialogTrigger asChild>
                      <div className="group cursor-pointer flex flex-col space-y-3">
                        {/* Thumbnail Container */}
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-border-subtle bg-bg-card flex items-center justify-center transition-transform group-hover:scale-[1.02] duration-200 shadow-sm">
                          {module.youtube_video_id && module.youtube_video_id !== 'unknown_id' ? (
                            <>
                              <img
                                src={`https://img.youtube.com/vi/${module.youtube_video_id}/hqdefault.jpg`}
                                alt={module.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            </>
                          ) : null}

                          {/* Duration Badge */}
                          {module.duration_seconds !== null && (
                            <div className="absolute bottom-2 right-2 z-10">
                              <Badge variant="secondary" className="bg-black/80 hover:bg-black/80 text-white border-0 font-mono text-[10px] px-1.5 py-0.5">
                                {formatDuration(module.duration_seconds)}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Video Metadata */}
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm text-text-main leading-tight group-hover:text-brand-accent transition-colors flex items-start gap-2">
                            <span className="flex-1">{module.title}</span>
                            {module.pdf_resource_url && (
                              <a
                                href={module.pdf_resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-text-meta hover:text-brand-accent transition-colors shrink-0"
                                title="Download PDF Resource"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                          </h3>
                          <p className="text-xs text-text-meta">
                            VIKR Training • {tab}
                          </p>
                          {module.market_segment && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-[10px] bg-bg-card border-border-subtle text-text-muted px-1.5 py-0">
                                {module.market_segment}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl p-0 bg-bg-card border-border-subtle overflow-hidden shadow-2xl">
                      <DialogHeader className="sr-only">
                        <DialogTitle>{module.title}</DialogTitle>
                        <DialogDescription>Video player for {module.title}</DialogDescription>
                      </DialogHeader>
                      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                        <iframe
                          className="absolute inset-0 w-full h-full border-0"
                          src={`https://www.youtube.com/embed/${module.youtube_video_id}?autoplay=0&rel=0`}
                          title={module.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="p-6 md:p-8 space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tight text-text-main mb-1">{module.title}</h2>
                          {module.description && (
                            <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
                              {module.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="secondary" className="bg-bg-hover text-text-main border-border-subtle px-3 py-1">{tab}</Badge>
                          {module.market_segment && (
                            <Badge variant="outline" className="border-border-subtle text-text-muted px-3 py-1">{module.market_segment}</Badge>
                          )}
                          {module.pdf_resource_url && (
                            <a
                              href={module.pdf_resource_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:underline ml-auto bg-brand-accent/10 px-4 py-2 rounded-lg transition-colors hover:bg-brand-accent/20"
                            >
                              <FileText className="w-4 h-4" />
                              Download Resource
                            </a>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}

            {!isLoading && !error && modules.filter(m => m.category === tab).length === 0 && (
              <div className="text-center py-24 text-text-meta">
                No videos available for this category yet.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

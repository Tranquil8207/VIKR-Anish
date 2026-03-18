"use client" // Trigger reload

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, FileText } from "lucide-react"
import { getTrainingModules } from "@/app/dashboard/actions/content"

type TrainingModule = {
  id: string
  title: string
  category: string
  duration: number | null
  video_url: string
  pdf_resource_url: string | null
  market_segment: string | null
}

export default function TrainingHubPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    loadModules()
  }, [])

  // Derive tabs dynamically from the loaded modules
  const uniqueTabs = Array.from(new Set(modules.map(m => m.category))).sort()
  // Add some defaults if empty so the UI doesn't look broken
  const TABS = uniqueTabs.length > 0 ? uniqueTabs : ["Sales", "Safety", "Application", "Onboarding"]

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "00:00"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-bg-main min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-text-main">Training Hub</h2>
        <p className="text-text-muted">Access training materials, safety guidelines, and sales resources.</p>
      </div>

      <Tabs defaultValue={TABS[0]} className="w-full">
        <TabsList className="mb-8 bg-bg-card border border-border-subtle p-1 w-full justify-start overflow-x-auto flex-nowrap shrink-0 snap-x">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="px-6 data-[state=active]:bg-bg-hover data-[state=active]:text-brand-accent text-text-muted whitespace-nowrap snap-start"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

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
                {modules.filter(m => m.category === tab).map((module) => (
                  <a href={module.video_url} target="_blank" rel="noopener noreferrer" key={module.id} className="group cursor-pointer flex flex-col space-y-3">
                    {/* Thumbnail Container */}
                    <div className={`relative aspect-video rounded-xl overflow-hidden border border-border-subtle bg-bg-card flex items-center justify-center transition-transform group-hover:scale-[1.02] duration-200`}>
                      <PlayCircle className="w-12 h-12 text-text-meta group-hover:text-brand-accent transition-colors" />

                      {/* Duration Badge */}
                      {module.duration !== null && (
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="bg-black/70 hover:bg-black/70 text-text-main border-0 font-mono text-[10px] px-1.5 py-0.5">
                            {formatDuration(module.duration)}
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
                  </a>
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

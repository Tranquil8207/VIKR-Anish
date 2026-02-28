"use client"

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Training Hub</h2>
        <p className="text-muted-foreground">Access training materials, safety guidelines, and sales resources.</p>
      </div>

      <Tabs defaultValue={TABS[0]} className="w-full">
        <TabsList className="mb-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 w-full justify-start overflow-x-auto flex-nowrap shrink-0 snap-x">
          {TABS.map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className="px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm whitespace-nowrap snap-start"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0 outline-none">
            {isLoading ? (
               <div className="flex justify-center items-center py-24 text-muted-foreground">
                 Loading modules...
               </div>
            ) : error ? (
                <div className="flex justify-center items-center py-24 text-red-500 font-medium">
                  {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {modules.filter(m => m.category === tab).map((module) => (
                    <a href={module.video_url} target="_blank" rel="noopener noreferrer" key={module.id} className="group cursor-pointer flex flex-col space-y-3">
                      {/* Thumbnail Container */}
                      <div className={`relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center transition-transform group-hover:scale-[1.02] duration-200`}>
                        <PlayCircle className="w-12 h-12 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                        
                         {/* Duration Badge */}
                         {module.duration !== null && (
                           <div className="absolute bottom-2 right-2">
                             <Badge variant="secondary" className="bg-black/70 hover:bg-black/70 text-white border-0 font-mono text-[10px] px-1.5 py-0.5">
                               {formatDuration(module.duration)}
                             </Badge>
                           </div>
                         )}
                      </div>
                      
                      {/* Video Metadata */}
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-primary transition-colors flex items-start gap-2">
                          <span className="flex-1">{module.title}</span>
                          {module.pdf_resource_url && (
                             <a 
                               href={module.pdf_resource_url} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               onClick={(e) => e.stopPropagation()}
                               className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                               title="Download PDF Resource"
                             >
                               <FileText className="w-4 h-4" />
                             </a>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Veritas Training • {tab}
                        </p>
                        {module.market_segment && (
                          <div className="pt-1 flex flex-wrap gap-1">
                             <Badge variant="outline" className="text-[10px] bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0">
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
              <div className="text-center py-24 text-muted-foreground">
                No videos available for this category yet.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

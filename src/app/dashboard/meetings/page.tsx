"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, Video, FileText } from "lucide-react"
import { getMyMeetings } from "@/app/dashboard/actions/meetings"

type Meeting = {
  id: string
  title: string
  date_time: string
  meet_link: string | null
  recording_url: string | null
  notes: string | null
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMeetings() {
      setIsLoading(true)
      const { success, data, error } = await getMyMeetings()
      if (success && data) {
        setMeetings(data as Meeting[])
      } else {
        setError(error || "Failed to load meetings.")
      }
      setIsLoading(false)
    }

    fetchMeetings()
  }, [])

  const handleScheduleCall = () => {
    // Open an external scheduling link (e.g., Calendly) in a new tab
    window.open("https://calendly.com", "_blank")
  }

  // Helper to format date and time cleanly
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString)
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meetings Log</h2>
          <p className="text-muted-foreground mt-1">View your past recordings and upcoming support calls.</p>
        </div>
        <Button onClick={handleScheduleCall} className="gap-2 shrink-0">
          <Calendar className="w-4 h-4" />
          Schedule a Call
        </Button>
      </div>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <TableRow>
              <TableHead className="w-[180px]">Date / Time</TableHead>
              <TableHead>Topic & Notes</TableHead>
              <TableHead className="text-right w-[200px]">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                   Loading meetings...
                 </TableCell>
               </TableRow>
            ) : error ? (
               <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-red-500 font-medium bg-red-50 dark:bg-red-950/20">
                   {error}
                 </TableCell>
               </TableRow>
            ) : meetings.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                   No meetings found in your log.
                 </TableCell>
               </TableRow>
            ) : (
                meetings.map((meeting) => {
                  const { date, time } = formatDateTime(meeting.date_time)
                  const isPast = new Date(meeting.date_time) < new Date()

                  return (
                    <TableRow key={meeting.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <TableCell className="align-top py-4">
                         <div className="font-medium text-zinc-900 dark:text-zinc-100">{date}</div>
                         <div className="text-sm text-zinc-500">{time}</div>
                         {isPast ? (
                           <Badge variant="outline" className="mt-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0 italic text-zinc-500">PAST</Badge>
                         ) : (
                           <Badge variant="default" className="mt-2 bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary px-1.5 py-0 text-[10px]">UPCOMING</Badge>
                         )}
                      </TableCell>
                      
                      <TableCell className="align-top py-4">
                         <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{meeting.title}</div>
                         {meeting.notes ? (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md line-clamp-2">
                              {meeting.notes}
                            </p>
                         ) : (
                            <span className="text-xs text-zinc-400 italic">No notes provided</span>
                         )}
                      </TableCell>
                      
                      <TableCell className="text-right align-top py-4">
                         <div className="flex flex-col items-end gap-2">
                           {meeting.meet_link && !isPast && (
                             <Button variant="outline" size="sm" className="h-8 gap-1.5 w-full sm:w-auto" onClick={() => window.open(meeting.meet_link!, "_blank")}>
                                <ExternalLink className="w-3.5 h-3.5" /> Join Chat
                             </Button>
                           )}
                           {meeting.recording_url && (
                             <Button variant="secondary" size="sm" className="h-8 gap-1.5 w-full sm:w-auto bg-zinc-100 dark:bg-zinc-800" onClick={() => window.open(meeting.recording_url!, "_blank")}>
                                <Video className="w-3.5 h-3.5" /> Watch Recording
                             </Button>
                           )}
                           {!meeting.meet_link && !meeting.recording_url && (
                              <span className="text-xs text-zinc-500 italic flex items-center gap-1"><FileText className="w-3 h-3"/> Log Only</span>
                           )}
                         </div>
                      </TableCell>
                    </TableRow>
                  )
                })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

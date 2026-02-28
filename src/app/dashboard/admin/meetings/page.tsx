"use client"

import React, { useState, useEffect } from "react"
import { getPartners } from "../../actions/admin"
import { createMeeting } from "../../actions/admin" // Assuming we exported createMeeting from admin actions recently
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"

// Assuming UserProfile structure from earlier
interface UserProfile {
  id: string
  territory_code: string
  email?: string
}

export default function AdminMeetingsPage() {
  const [partners, setPartners] = useState<UserProfile[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)

  const [partnerId, setPartnerId] = useState("")
  const [title, setTitle] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [meetLink, setMeetLink] = useState("")
  const [recordingUrl, setRecordingUrl] = useState("")
  const [notes, setNotes] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPartners() {
      setIsLoadingPartners(true)
      const result = await getPartners()
      if (result.success && result.data) {
        // Filter out admins if you only want to assign meetings to standard partners, 
        // or just show everyone. We'll show everyone for now.
        setPartners(result.data as UserProfile[])
      } else {
        console.error("Failed to load partners:", result.error)
      }
      setIsLoadingPartners(false)
    }
    loadPartners()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!partnerId || !title || !dateTime) {
      setError("Please fill out all required fields.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("partner_id", partnerId)
    formData.append("title", title)
    // Assuming backend expecting ISO string, dateTime-local gives YYYY-MM-DDTHH:mm
    const isoDate = new Date(dateTime).toISOString()
    formData.append("date_time", isoDate)
    
    if (meetLink) formData.append("meet_link", meetLink)
    if (recordingUrl) formData.append("recording_url", recordingUrl)
    if (notes) formData.append("notes", notes)

    const result = await createMeeting(formData)

    if (result.success) {
      alert("Meeting assigned successfully!")
      // Reset form
      setPartnerId("")
      setTitle("")
      setDateTime("")
      setMeetLink("")
      setRecordingUrl("")
      setNotes("")
    } else {
      setError(result.error || "Failed to create meeting.")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Meeting Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Schedule and assign corporate meetings or training sessions to specific partners.
        </p>
      </div>

      <Card className="shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Schedule New Meeting
            </CardTitle>
            <CardDescription>
              Assign a meeting to a partner. They will see this in their communication center.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="partnerId">Select Partner (Required)</Label>
              <Select value={partnerId} onValueChange={setPartnerId} disabled={isLoadingPartners} required>
                <SelectTrigger id="partnerId" className="w-full">
                  <SelectValue placeholder={isLoadingPartners ? "Loading partners..." : "Select a partner"} />
                </SelectTrigger>
                <SelectContent>
                  {partners.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-mono text-xs text-muted-foreground mr-2">{p.id.substring(0,6)}</span>
                      {p.territory_code} Partner
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="title">Meeting Title (Required)</Label>
                 <Input
                   id="title"
                   placeholder="e.g. Q3 NA Sales Strategy Review"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   required
                 />
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="dateTime">Date & Time (Required)</Label>
                 <Input
                   id="dateTime"
                   type="datetime-local"
                   value={dateTime}
                   onChange={(e) => setDateTime(e.target.value)}
                   required
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="meetLink">Video Call Link (Optional)</Label>
                 <Input
                   id="meetLink"
                   type="url"
                   placeholder="e.g. https://meet.google.com/xyz"
                   value={meetLink}
                   onChange={(e) => setMeetLink(e.target.value)}
                 />
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="recordingUrl">Recording Content URL (Optional)</Label>
                 <Input
                   id="recordingUrl"
                   type="url"
                   placeholder="e.g. https://drive.google.com/..."
                   value={recordingUrl}
                   onChange={(e) => setRecordingUrl(e.target.value)}
                 />
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Meeting Notes (Optional)</Label>
              <Textarea 
                 id="notes"
                 placeholder="Agenda points or post-meeting summary..."
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 className="min-h-[100px] resize-y"
              />
            </div>

            {error && (
               <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-md border border-red-200">{error}</p>
            )}

          </CardContent>
          <CardFooter className="bg-slate-50 border-t dark:bg-slate-900 dark:border-slate-800">
             <Button type="submit" className="w-full sm:w-auto ml-auto" disabled={isSubmitting || isLoadingPartners}>
               {isSubmitting ? "Assigning Meeting..." : "Assign Meeting to Partner"}
             </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

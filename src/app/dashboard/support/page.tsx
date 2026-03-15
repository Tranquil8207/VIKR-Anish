"use client" // Trigger reload

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select"
import { MessageSquarePlus } from "lucide-react"
import { getMyTickets, createSupportTicket } from "@/app/dashboard/actions/support"

type Ticket = {
   id: string
   ticket_id: string
   category: string
   description: string
   status: string
   created_at: string
}

export default function SupportTicketingPage() {
   const [tickets, setTickets] = useState<Ticket[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const loadTickets = async () => {
      setIsLoading(true)
      const { success, data, error } = await getMyTickets()
      if (success && data) {
         setTickets(data as Ticket[])
         setError(null)
      } else {
         setError(error || "Failed to load tickets.")
      }
      setIsLoading(false)
   }

   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadTickets()
   }, [])

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsSubmitting(true)

      // Use FormData from the current event target
      const formData = new FormData(e.currentTarget)

      const { success, error } = await createSupportTicket(formData)

      if (success) {
         alert("Ticket Submitted Successfully!")
         loadTickets() // Refresh the list
            // Reset the form
            ; (e.target as HTMLFormElement).reset()
      } else {
         alert(error || "Failed to submit ticket.")
      }

      setIsSubmitting(false)
   }

   const getBadgeVariant = (state: string) => {
      switch (state) {
         case "OPEN": return "secondary"
         case "IN_PROGRESS": return "default"
         case "RESOLVED": return "outline"
         default: return "secondary"
      }
   }

   return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 w-full bg-bg-main min-h-full">
         <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-main">Partner Support</h2>
            <p className="text-text-muted mt-1">Submit a new request or check the status of your existing tickets.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

            {/* Create Ticket Form */}
            <div className="md:col-span-1 space-y-6 shrink-0">
               <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
                  <div className="p-5 border-b border-border-subtle">
                     <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                        <MessageSquarePlus className="w-5 h-5 text-brand-accent" />
                        New Ticket
                     </h3>
                     <p className="text-sm text-text-muted mt-1">We typically respond within 24 hours.</p>
                  </div>
                  <div className="p-5">
                     <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-text-main" htmlFor="category">Category</label>
                           <Select required name="category" defaultValue="Technical">
                              <SelectTrigger id="category" className="w-full bg-bg-main border-border-subtle text-text-main">
                                 <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="Pricing">Pricing &amp; Sales</SelectItem>
                                 <SelectItem value="Technical">Technical Application</SelectItem>
                                 <SelectItem value="Docs">Documentation</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-medium text-text-main" htmlFor="description">Description</label>
                           <Textarea
                              id="description"
                              name="description"
                              required
                              placeholder="Please describe your issue or request in detail..."
                              className="min-h-[120px] resize-y w-full bg-bg-main border-border-subtle text-text-main placeholder:text-text-meta"
                           />
                        </div>

                        <Button type="submit" className="w-full bg-brand-accent hover:bg-[#4e9422] text-black font-bold" disabled={isSubmitting}>
                           {isSubmitting ? "Submitting..." : "Submit Ticket"}
                        </Button>
                     </form>
                  </div>
               </div>
            </div>

            {/* My Tickets View */}
            <div className="md:col-span-2 space-y-6 min-w-0">
               <h3 className="text-xl font-semibold text-text-main">My Tickets</h3>
               <div className="grid gap-4">
                  {isLoading ? (
                     <div className="text-center py-12 text-text-meta border rounded-lg border-dashed border-border-subtle">
                        Loading your tickets...
                     </div>
                  ) : error ? (
                     <div className="text-center py-12 text-red-400 font-medium border rounded-lg border-dashed border-red-500/20 bg-red-500/10">
                        {error}
                     </div>
                  ) : tickets.length === 0 ? (
                     <div className="text-center py-12 text-text-meta border rounded-lg border-dashed border-border-subtle">
                        You haven&apos;t submitted any tickets yet.
                     </div>
                  ) : (
                     tickets.map(ticket => (
                        <div key={ticket.id} className="rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-hover transition-all overflow-hidden">
                           <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                              <div className="space-y-1.5 w-full sm:w-2/3">
                                 <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-mono text-text-meta bg-bg-main px-2 py-0.5 rounded border border-border-subtle">
                                       {ticket.ticket_id || ticket.id.substring(0, 8)}
                                    </span>
                                    <span className="text-sm font-semibold text-text-main">
                                       {ticket.category}
                                    </span>
                                 </div>
                                 <p className="text-sm text-text-muted line-clamp-2 sm:line-clamp-3 overflow-wrap break-words word-break">
                                    {ticket.description}
                                 </p>
                              </div>

                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1.5 pl-0 sm:pl-4 sm:border-l border-border-subtle mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 shrink-0">
                                 <Badge variant={getBadgeVariant(ticket.status)}>
                                    {ticket.status.replace("_", " ")}
                                 </Badge>
                                 <span className="text-xs text-text-meta whitespace-nowrap">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

         </div>
      </div>
   )
}

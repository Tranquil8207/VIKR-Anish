"use client"

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
      ;(e.target as HTMLFormElement).reset()
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Partner Support</h2>
        <p className="text-muted-foreground mt-1">Submit a new request or check the status of your existing tickets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Create Ticket Form */}
        <div className="md:col-span-1 space-y-6 shrink-0">
           <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <MessageSquarePlus className="w-5 h-5 text-primary" />
                   New Ticket
                </CardTitle>
                <CardDescription>We typically respond within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                 <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-sm font-medium" htmlFor="category">Category</label>
                       <Select required name="category" defaultValue="Technical">
                          <SelectTrigger id="category" className="w-full">
                             <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="Pricing">Pricing & Sales</SelectItem>
                             <SelectItem value="Technical">Technical Application</SelectItem>
                             <SelectItem value="Docs">Documentation</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium" htmlFor="description">Description</label>
                       <Textarea 
                          id="description"
                          name="description"
                          required 
                          placeholder="Please describe your issue or request in detail..."
                          className="min-h-[120px] resize-y w-full"
                       />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                       {isSubmitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>

        {/* My Tickets View */}
        <div className="md:col-span-2 space-y-6 min-w-0">
           <h3 className="text-xl font-semibold">My Tickets</h3>
           <div className="grid gap-4">
              {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                      Loading your tickets...
                  </div>
              ) : error ? (
                  <div className="text-center py-12 text-red-500 font-medium border rounded-lg border-dashed border-red-200 bg-red-50">
                      {error}
                  </div>
              ) : tickets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                      You haven&apos;t submitted any tickets yet.
                  </div>
              ) : (
                  tickets.map(ticket => (
                     <Card key={ticket.id} className="transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer overflow-hidden">
                        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                           <div className="space-y-1.5 w-full sm:w-2/3">
                              <div className="flex items-center gap-3 mb-1">
                                 <span className="text-xs font-mono text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                   {ticket.ticket_id || ticket.id.substring(0,8)}
                                 </span>
                                 <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                   {ticket.category}
                                 </span>
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 sm:line-clamp-3 overflow-wrap break-words word-break">
                                {ticket.description}
                              </p>
                           </div>
                           
                           <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1.5 pl-0 sm:pl-4 sm:border-l border-zinc-100 dark:border-zinc-800 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 shrink-0">
                              <Badge variant={getBadgeVariant(ticket.status)}>
                                 {ticket.status.replace("_", " ")}
                              </Badge>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                 {new Date(ticket.created_at).toLocaleDateString()}
                              </span>
                           </div>
                        </CardContent>
                     </Card>
                  ))
              )}
           </div>
        </div>

      </div>
    </div>
  )
}

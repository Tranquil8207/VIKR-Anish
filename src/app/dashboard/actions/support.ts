'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

type TicketCategory = Database['public']['Tables']['support_tickets']['Row']['category']

export async function createSupportTicket(formData: FormData) {
  const supabase = await createClient()

  const category = formData.get('category') as TicketCategory
  const description = formData.get('description') as string

  if (!category || !description) {
    return { success: false, error: 'Category and description are required.' }
  }

  // Get current user id
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('support_tickets')
    .insert({
      partner_id: user.id,
      category,
      description,
      status: 'OPEN' // Default value from schema, explicit here for clarity
    })

  if (error) {
    console.error('Error creating support ticket:', error)
    return { success: false, error: 'Failed to submit ticket. Please try again later.' }
  }

  revalidatePath('/dashboard/support')
  return { success: true }
}

export async function getMyTickets() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: null, error: 'Not authenticated', isAdmin: false }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  const isAdmin = profile?.is_admin || false

  // RLS ensures they only see their own tickets
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching support tickets:', error)
    return { success: false, data: null, error: error.message, isAdmin }
  }

  // Manually attach profiles to bypass any Supabase relationship cache issues
  if (data && data.length > 0 && isAdmin) {
    const partnerIds = Array.from(new Set(data.map(t => t.partner_id)))
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, company_name')
      .in('id', partnerIds)

    if (profilesData) {
      const profileMap = Object.fromEntries(profilesData.map(p => [p.id, p]))
      data.forEach(t => {
        (t as any).profiles = profileMap[t.partner_id] || null
      })
    }
  }

  return { success: true, data, isAdmin }
}

export async function updateTicketStatus(ticket_id: string, status: Database['public']['Enums']['ticket_status']) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('ticket_id', ticket_id)

  if (error) {
    console.error('Error updating ticket status:', error)
    return { success: false, error: 'Failed to update ticket.' }
  }

  revalidatePath('/dashboard/support')
  return { success: true }
}

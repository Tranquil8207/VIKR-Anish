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

  // RLS ensures they only see their own tickets
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching support tickets:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

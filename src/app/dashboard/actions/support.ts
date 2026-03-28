'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.')
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

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

  // Check if profile exists to avoid foreign key violation
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!profile) {
    return { success: false, error: 'User profile not found. Please contact support.' }
  }

  const { error } = await supabase
    .from('support_tickets')
    .insert({
      partner_id: user.id,
      category,
      description,
      status: 'OPEN'
    })

  if (error) {
    console.error('Error creating support ticket:', error)
    return { success: false, error: `Error: ${error.message} (${error.code})` }
  }

  revalidatePath('/dashboard/support')
  return { success: true }
}

export async function getMyTickets() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: null, error: 'Not authenticated', isAdmin: false }

  // Use admin client to check admin status to bypass recursive RLS
  const supabaseAdmin = createAdminClient()
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.is_admin || false

  let data, error

  if (isAdmin) {
    // Admins see all tickets
    const res = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
    data = res.data
    error = res.error
  } else {
    // Regular users rely on RLS (Users manage own tickets)
    const res = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
    data = res.data
    error = res.error
  }

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

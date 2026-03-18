'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Service-role client — bypasses RLS for all queries
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Returns meetings where the current user is either:
 *  - the person who scheduled it (scheduled_by = me), or
 *  - listed as a participant (me = ANY(participant_ids))
 */
export async function getMyMeetings() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, data: null, error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .or(`scheduled_by.eq.${user.id},participant_ids.cs.{${user.id}}`)
    .order('date_time', { ascending: false })

  if (error) {
    console.error('Error fetching meetings:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

/**
 * Returns all user profiles for the participant picker.
 * Uses the service-role client to bypass the recursive RLS on profiles.
 */
export async function getAllUsers() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, data: null, error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, territory_code, email, full_name, is_admin')
    .order('territory_code', { ascending: true })

  if (error) {
    console.error('Error fetching users:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

/**
 * Unified meeting scheduler — open to ALL authenticated users.
 * Sets scheduled_by = caller, participant_ids = selected invitees.
 * Any user listed as scheduler OR participant can see the meeting.
 */
export async function scheduleMeeting(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const dateTimeStr = formData.get('date_time') as string
  const participantIds = formData.getAll('participant_ids') as string[]
  const meetLink = formData.get('meet_link') as string
  const recordingUrl = formData.get('recording_url') as string
  const notes = formData.get('notes') as string

  if (!title || !dateTimeStr || participantIds.length === 0) {
    return { success: false, error: 'Title, date/time, and at least one participant are required.' }
  }

  // Ensure the creator themselves is always a participant
  const allParticipantIds = Array.from(new Set([user.id, ...participantIds]))

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('meetings')
    .insert({
      partner_id: participantIds[0],   // kept for backward-compat (primary participant)
      scheduled_by: user.id,           // who created the meeting
      participant_ids: allParticipantIds, // all invitees (one or many) + scheduler
      title,
      date_time: new Date(dateTimeStr).toISOString(),
      meet_link: meetLink || null,
      recording_url: recordingUrl || null,
      notes: notes || null,
    })

  if (error) {
    console.error('Error scheduling meeting:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/meetings')
  return { success: true }
}

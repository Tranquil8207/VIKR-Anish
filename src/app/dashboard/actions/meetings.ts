'use server'

import { createClient } from '@/utils/supabase/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Database } from '@/types/supabase'

export async function getMyMeetings() {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, data: null, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('partner_id', user.id)
    .order('date_time', { ascending: false })

  if (error) {
    console.error('Error fetching meetings:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

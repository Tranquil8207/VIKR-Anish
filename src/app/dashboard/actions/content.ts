'use server'

import { createClient } from '@/utils/supabase/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Database } from '@/types/supabase'

export async function getTrainingModules() {
  const supabase = await createClient()

  // Thanks to RLS, this will automatically only return modules 
  // valid for the user's territory_code (or GLOBAL)
  const { data, error } = await supabase
    .from('training_modules')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching training modules:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

export async function getAnnouncements(limit: number = 5) {
  const supabase = await createClient()

  // Pinned announcements first, then newest
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('date_posted', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching announcements:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

// ------------------------------------------------------------------
// MEETINGS (Phase 2.3 Gap)
// ------------------------------------------------------------------

export async function getMeetings() {
  const supabase = await createClient()

  // RLS ensures the user only sees meetings assigned to their `partner_id`
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date_time', { ascending: false })

  if (error) {
    console.error('Error fetching meetings:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

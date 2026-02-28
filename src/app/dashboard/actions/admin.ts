'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

type Territory = Database['public']['Enums']['territory']

/**
 * Checks if the current user is an admin.
 * Used internally by admin actions to prevent unauthorized access.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_admin) {
    throw new Error('Unauthorized: Admin access required')
  }

  return user
}

// ------------------------------------------------------------------
// USER MANAGEMENT (Phase 3.3)
// ------------------------------------------------------------------

export async function getPartners() {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error fetching partners:', error)
    return { success: false, data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updatePartnerTerritory(partnerId: string, newTerritory: Territory) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)
    
    const { error } = await supabase
      .from('profiles')
      .update({ territory_code: newTerritory })
      .eq('id', partnerId)

    if (error) throw error

    revalidatePath('/dashboard/admin/users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating partner territory:', error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ------------------------------------------------------------------
// CONTENT MANAGEMENT (Phase 3.4 - Partial)
// ------------------------------------------------------------------

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    try {
        await requireAdmin(supabase)

        const sku = formData.get('sku') as string
        const name = formData.get('name') as string
        const category = formData.get('category') as string
        const ph_level = parseFloat(formData.get('ph_level') as string)

        if (!sku || !name) throw new Error('SKU and Name are required')

        const { error } = await supabase
            .from('products')
            .insert({ sku, name, category, ph_level: isNaN(ph_level) ? null : ph_level })

        if (error) throw error

        revalidatePath('/dashboard/admin/cms')
        return { success: true }
    } catch (error: unknown) {
        console.error('Error creating product:', error)
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
}

// ------------------------------------------------------------------
// MEETINGS (Phase 2.3 & 3.4 Gaps)
// ------------------------------------------------------------------

export async function createMeeting(formData: FormData) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)

    const partnerId = formData.get('partner_id') as string
    const title = formData.get('title') as string
    const dateTimeStr = formData.get('date_time') as string // Expected ISO string
    const meetLink = formData.get('meet_link') as string
    const recordingUrl = formData.get('recording_url') as string
    const notes = formData.get('notes') as string

    if (!partnerId || !title || !dateTimeStr) {
        throw new Error('Partner, Title, and Date are required')
    }

    const { error } = await supabase
      .from('meetings')
      .insert({
        partner_id: partnerId,
        title,
        date_time: dateTimeStr,
        meet_link: meetLink || null,
        recording_url: recordingUrl || null,
        notes: notes || null
      })

    if (error) throw error

    revalidatePath('/dashboard/admin/meetings')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error creating meeting:', error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

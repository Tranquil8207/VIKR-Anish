'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

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

type Territory = Database['public']['Enums']['territory']

/**
 * Checks if the current user is an admin.
 * Uses the service role client to bypass the recursive RLS policy on profiles,
 * which would otherwise cause Supabase to return null and fail the check.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Use admin client to bypass the recursive "Admins can view all profiles" RLS policy
  const supabaseAdmin = createAdminClient()
  const { data: profile } = await supabaseAdmin
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

    // Use admin client to fetch all profiles — the anon client's SELECT policy
    // on profiles is recursive and returns null for cross-user queries
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
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

export async function createPartner(formData: FormData) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const territoryCode = formData.get('territory_code') as Territory
    const fullName = formData.get('full_name') as string

    if (!email || !password || !territoryCode) {
      throw new Error('Email, password, and territory are required')
    }

    const supabaseAdmin = createAdminClient()

    // Pass territory_code and full_name in user_metadata so the
    // on_auth_user_created trigger can cast it correctly to the territory enum
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || null,
        territory_code: territoryCode,
      }
    })

    if (authError) throw authError

    // Do a follow-up upsert to guarantee the territory and name are set correctly,
    // in case the trigger ran before the metadata was fully resolved
    if (data?.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          territory_code: territoryCode,
          is_admin: false, // Always partner — admin status must be granted separately
          ...(fullName ? { full_name: fullName } : {}),
        }, { onConflict: 'id' })

      if (profileError) {
        // Log but don't throw — user was created successfully, profile update is best-effort
        console.error('Profile update after user creation failed:', profileError)
      }
    }

    revalidatePath('/dashboard/admin/users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error creating partner:', error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function resetPartnerPassword(partnerId: string, newPassword: string) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.auth.admin.updateUserById(partnerId, {
      password: newPassword,
    })

    if (error) throw error

    return { success: true }
  } catch (error: unknown) {
    console.error('Error resetting partner password:', error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ------------------------------------------------------------------
// CONTENT MANAGEMENT (Phase 3.4 - Partial)
// ------------------------------------------------------------------

export async function getProducts() {
  const supabase = await createClient()
  try {
    await requireAdmin(supabase)
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, name')
      .order('name', { ascending: true })
    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error fetching products:', error)
    return { success: false, data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

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

// ------------------------------------------------------------------
// EDUCATION & ENGAGEMENT (Phase 2.1 & 3.4 Gaps)
// ------------------------------------------------------------------

export async function createTrainingModule(formData: FormData) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const video_url = formData.get('video_url') as string
    const pdf_url = formData.get('pdf_url') as string
    const category = formData.get('category') as string
    const market_segment = formData.get('market_segment') as string

    if (!title || !video_url) {
      throw new Error('Title and Video URL are required')
    }

    const { error } = await supabase
      .from('training_modules')
      .insert({
        title,
        description: description || null,
        video_url,
        pdf_url: pdf_url || null,
        category,
        market_segment
      })

    if (error) throw error

    revalidatePath('/dashboard/training')
    revalidatePath('/dashboard/admin/cms')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error creating training module:', error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const attachment_url = formData.get('attachment_url') as string
    const is_pinned = formData.get('is_pinned') === 'true'

    if (!title || !content) {
      throw new Error('Title and Content are required')
    }

    const { error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        attachment_url: attachment_url || null,
        is_pinned
      })

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin/cms')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error creating announcement:', error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

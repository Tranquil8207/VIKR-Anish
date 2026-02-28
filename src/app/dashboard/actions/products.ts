'use server'

import { createClient } from '@/utils/supabase/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Database } from '@/types/supabase'

export async function getProductsWithDocuments() {
  const supabase = await createClient()

  // Due to RLS, documents fetching will automatically be filtered
  // by the user's territory_code.
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      documents (*)
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching products with documents:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

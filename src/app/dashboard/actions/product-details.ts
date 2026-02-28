"use server"

import { createClient } from '@/utils/supabase/server'

export async function getProductById(id: string) {
  const supabase = await createClient()

  // Fetch product alongside documents and product_media
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      documents (*),
      product_media (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product by ID:', error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data }
}

'use server'

import { createClient } from '@/utils/supabase/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { revalidatePath } from 'next/cache'

export async function getSecureDocumentUrl(documentId: string, expiresInSeconds: number = 3600) {
  const supabase = await createClient()

  try {
    // 1. First get the document record to find its file path
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', documentId)
      .single()

    if (docError) throw docError
    if (!document || !document.file_url) throw new Error('Document file not found')

    // 2. Generate the pre-signed URL using the file_url
    // Since our DB stores the path inside the bucket (e.g. 'demo/tds-cleaner-global.pdf')
    const { data, error } = await supabase
      .storage
      .from('secure_documents')
      .createSignedUrl(document.file_url, expiresInSeconds, {
        download: false
      })

    if (error) throw error

    const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(document.file_url || '')

    return {
      success: true,
      url: data.signedUrl,
      isImage
    }

  } catch (error) {
    console.error('Error generating secure document URL:', error)
    return {
      success: false,
      error: 'Failed to generate secure link. Ensure you have permission to view this document.'
    }
  }
}

export async function getAllDocuments() {
  const supabase = await createClient()

  try {
    // Due to RLS, documents fetching will automatically be filtered
    // by the user's territory_code. We also try to fetch the associated product name.
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        products (
          name,
          sku
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error fetching documents:', error)
    return { success: false, data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

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
      .createSignedUrl(document.file_url, expiresInSeconds)

    if (error) throw error

    return { 
      success: true, 
      url: data.signedUrl 
    }
    
  } catch (error) {
    console.error('Error generating secure document URL:', error)
    return { 
      success: false, 
      error: 'Failed to generate secure link. Ensure you have permission to view this document.' 
    }
  }
}

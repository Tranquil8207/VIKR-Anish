import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Verify Admin Access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 2. Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('product_id') as string // might be 'general'
    const title = formData.get('title') as string
    const category = formData.get('category') as Database['public']['Enums']['document_category']
    const regions = formData.getAll('valid_regions') as string[]

    if (!file || !title || !category || regions.length === 0) {
      return NextResponse.json({ error: 'Missing required title, category, fields, or regions' }, { status: 400 })
    }

    // 3. Upload File to Storage
    const isGeneral = !productId || productId === 'general'
    const folderName = isGeneral ? 'general' : productId

    const fileExt = file.name.split('.').pop()
    const fileName = `${folderName}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('secure_documents')
      .upload(fileName, file)

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    // 4. Create Database Record
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        product_id: isGeneral ? null : productId,
        title,
        file_url: fileName, // The path inside the bucket
        category,
        valid_regions: regions as Database['public']['Enums']['territory'][]
      })

    if (dbError) throw new Error(`Database insert failed: ${dbError.message}`)

    return NextResponse.json({ success: true, message: 'Document uploaded successfully' })

  } catch (error: unknown) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}

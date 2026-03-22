import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
        const file = formData.get('mediaFile') as File
        const productId = formData.get('product_id') as string
        const mediaType = formData.get('media_type') as string

        if (!file || !productId || !mediaType) {
            return NextResponse.json({ error: 'Missing required media fields' }, { status: 400 })
        }

        // 3. Upload File to Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${productId}/${Date.now()}.${fileExt}`

        // Use product_media bucket
        const { error: uploadError } = await supabase.storage
            .from('Product_Images')
            .upload(fileName, file, { upsert: true })

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('Product_Images')
            .getPublicUrl(fileName)

        // 4. Create Database Record
        const { error: dbError } = await supabase
            .from('product_media')
            .insert({
                product_id: productId,
                media_url: publicUrl,
                type: mediaType as 'Before' | 'After' | 'Marketing' | 'Packaging'
            })

        if (dbError) throw new Error(`Database insert failed: ${dbError.message}`)

        return NextResponse.json({ success: true, message: 'Product media uploaded successfully' })

    } catch (error: unknown) {
        console.error('Upload Media Error:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
    }
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, FileText, ImageIcon, ExternalLink, Loader2 } from "lucide-react"
import { getProductById } from "@/app/dashboard/actions/product-details"
import { getSecureDocumentUrl } from "@/app/dashboard/actions/document"

type Document = {
  id: string
  title: string
  category: string
  valid_regions: string[]
  file_url: string
}

type ProductMedia = {
  id: string
  media_url: string
  type: string
  description: string | null
}

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  ph_level: number | null
  documents: Document[]
  product_media: ProductMedia[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null)
  const [activePdfTitle, setActivePdfTitle] = useState<string | null>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true)
      const { success, data, error } = await getProductById(productId)
      if (success && data) {
        setProduct(data as Product)
      } else {
        setError(error || "Product not found")
      }
      setIsLoading(false)
    }

    if (productId) fetchProduct()
  }, [productId])

  const loadPdfViewer = async (documentId: string, title: string) => {
    setIsPdfLoading(true)
    setActivePdfTitle(title)
    
    // Get secure signed URL for iframe embedding (expires in 1 hour)
    const { success, url } = await getSecureDocumentUrl(documentId, 3600)
    
    if (success && url) {
      setActivePdfUrl(url)
    } else {
      alert("Failed to load secure document. You may not have access to this region's file.")
      setActivePdfUrl(null)
    }
    
    setIsPdfLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Package className="w-12 h-12 text-zinc-300" />
        <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Product Not Found</h3>
        <p className="text-zinc-500 text-sm max-w-sm text-center">{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Back Button */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {product.name}
              </h1>
              <Badge variant="secondary" className="font-mono text-sm md:text-base px-2 py-0.5 mt-1">
                {product.sku}
              </Badge>
            </div>
            {product.description && (
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mt-3 leading-relaxed">
                {product.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {product.category && (
                <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900">
                  Category: {product.category}
                </Badge>
              )}
              {product.ph_level !== null && (
                <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900">
                  pH Level: {product.ph_level}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Documents & Setup */}
        <div className="space-y-8 lg:col-span-1 border-t lg:border-t-0 pt-8 lg:pt-0 border-zinc-200 dark:border-zinc-800">
          
          {/* Documents Widget */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-500" />
                Technical Documents
              </CardTitle>
              <CardDescription>
                Region-locked technical and safety data sheets
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {product.documents && product.documents.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {product.documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer flex flex-col gap-2 ${activePdfTitle === doc.title ? 'bg-zinc-50 dark:bg-zinc-900/80 border-l-2 border-l-primary' : ''}`}
                      onClick={() => loadPdfViewer(doc.id, doc.title)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight pr-4">
                          {doc.title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] leading-none py-1 h-auto font-mono shrink-0">
                          {doc.category}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          Click to view
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-6 h-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // If they want to pop it out, get a fresh URL
                            loadPdfViewer(doc.id, doc.title).then(() => {
                               if (activePdfUrl) window.open(activePdfUrl, '_blank')
                            })
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="sr-only">Pop out</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No documents available for this region.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Media & Use-Cases Widget (Phase 1.4) */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-zinc-500" />
                Media & Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {product.product_media && product.product_media.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-px bg-zinc-200 dark:bg-zinc-800">
                  {product.product_media.map((media) => (
                    <div key={media.id} className="bg-white dark:bg-zinc-950 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 group">
                       <div className="aspect-video relative rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                         {/* Fallback image wrapper since we only have raw URLs */}
                         <div 
                           className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" 
                           style={{ backgroundImage: `url(${media.media_url})` }}
                           aria-label={media.description || "Product Media"}
                         />
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm shadow-none">
                              {media.type}
                            </Badge>
                         </div>
                       </div>
                       {media.description && (
                         <p className="text-sm mt-3 text-zinc-600 dark:text-zinc-400 leading-snug">
                           {media.description}
                         </p>
                       )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No media available for this product yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: In-App PDF Viewer */}
        <div className="lg:col-span-2 h-full min-h-[500px] lg:min-h-[800px] flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/50 overflow-hidden shadow-inner">
          {isPdfLoading ? (
             <div className="flex-1 flex flex-col justify-center items-center">
                 <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-4" />
                 <p className="text-sm font-medium text-zinc-500">Generating secure link...</p>
             </div>
          ) : activePdfUrl ? (
            <div className="flex-1 flex flex-col w-full h-full">
               <div className="bg-zinc-800 text-zinc-200 py-2 px-4 flex justify-between items-center text-sm shrink-0">
                 <span className="font-medium truncate pr-4">{activePdfTitle}</span>
                 <a 
                   href={activePdfUrl} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-white hover:text-primary-400 transition-colors flex items-center gap-1.5 shrink-0 bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                 >
                   <ExternalLink className="w-3.5 h-3.5" /> Open
                 </a>
               </div>
               <iframe 
                 src={`${activePdfUrl}#view=FitH`} 
                 className="w-full flex-1 border-0" 
                 title={activePdfTitle || "Document Viewer"}
               />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
               <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                 <FileText className="w-8 h-8 text-zinc-400" />
               </div>
               <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                 Select a Document
               </h3>
               <p className="text-sm text-zinc-500 max-w-sm">
                 Choose a technical document from the list on the left to securely view it in-app.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, FileText } from "lucide-react"
import { getProductsWithDocuments } from "@/app/dashboard/actions/products"
import { ShareDocumentButton } from "@/components/ShareDocumentButton"
import Link from "next/link"

// Type Definitions
type Document = {
  id: string
  title: string
  category: string
  valid_regions: string[]
  file_url: string
}

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  ph_level: number | null
  documents: Document[]
}

const CATEGORIES = ["Cleaning", "Polishing", "Maintenance", "Restoration", "Hardware", "Software"]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [phRange, setPhRange] = useState([0, 14])

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      const { success, data, error } = await getProductsWithDocuments()
      if (success && data) {
        setProducts(data as Product[])
      } else {
        setError(error || "Failed to load products")
      }
      setIsLoading(false)
    }

    loadProducts()
  }, [])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category))
    const ph = product.ph_level ?? 7 // Default to 7 if null for filtering purposes
    const matchesPh = ph >= phRange[0] && ph <= phRange[1]
    return matchesCategory && matchesPh
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Product Catalog</h2>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-3">Categories</h3>
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-3">
                <Checkbox 
                  id={`cat-${category}`} 
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <label 
                  htmlFor={`cat-${category}`} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">pH Level</h3>
            <span className="text-xs text-muted-foreground">{phRange[0]} - {phRange[1]}</span>
          </div>
          <Slider
            defaultValue={[0, 14]}
            max={14}
            min={0}
            step={1}
            value={phRange}
            onValueChange={setPhRange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Acidic (0)</span>
            <span>Alkaline (14)</span>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-24 text-muted-foreground">
            Loading products...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-24 text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md cursor-default border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-6 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                   <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <Link href={`/dashboard/products/${product.id}`} className="hover:underline decoration-zinc-400 underline-offset-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded max-w-24 truncate" title={product.sku}>
                      {product.sku}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {product.ph_level !== null && (
                      <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
                        pH {product.ph_level}
                      </span>
                    )}
                    {product.category && (
                      <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Documents Section */}
                  {product.documents && product.documents.length > 0 && (
                    <div className="mt-auto pt-6">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b pb-1 dark:border-zinc-800">
                        Available Documents
                      </h4>
                      <div className="space-y-2">
                        {product.documents.map((doc) => (
                          <div key={doc.id} className="flex flex-col gap-2 p-2 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-sm font-medium line-clamp-1 flex-1">{doc.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="text-[10px] leading-none py-0.5 px-1.5 font-mono h-auto">
                                {doc.category}
                              </Badge>
                              <ShareDocumentButton documentId={doc.id} title={doc.title} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && filteredProducts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <Package className="w-12 h-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No products found</h3>
            <p className="text-zinc-500 mt-1 max-w-sm">Try adjusting your filters or wait for admins to add products accessible to your region.</p>
          </div>
        )}
      </main>
    </div>
  )
}

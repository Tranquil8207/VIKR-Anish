"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, FileText, Filter, Search } from "lucide-react"
import { getProductsWithDocuments } from "@/app/dashboard/actions/products"
import { ShareDocumentButton } from "@/components/ShareDocumentButton"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Type Definitions
type ProductMedia = {
  id: string
  media_url: string
  type: string
}

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
  usp: string | null
  features_benefits: string | null
  applications: string | null
  ingredients: string | null
  directions_to_use: string | null
  documents: Document[]
  product_media: ProductMedia[]
}

const CATEGORIES = [
  "TOILET & BATHROOM",
  "SURFACE CLEANING",
  "KITCHEN CARE",
  "FABRIC CARE",
  "AIR FRESHNER",
  "INDUSTRIAL",
  "POULTRY FARM",
  "MEDICAL"
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

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

  const isAirFreshenerVariant = (name: string) => {
    return name !== "BIO AIR FRESHENER" &&
      (name.toUpperCase().startsWith("BIO AIR FRESHENER") ||
        name.toUpperCase().startsWith("BIO AIR FRESHNER"));
  }

  const isHandWashVariant = (name: string) => {
    return name !== "BIO HANDWASH" && name.toUpperCase().startsWith("BIO HAND WASH");
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category))
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && !isAirFreshenerVariant(product.name) && !isHandWashVariant(product.name)
  })

  const airFreshenerVariants = products.filter(p => isAirFreshenerVariant(p.name));
  const handWashVariants = products.filter(p => isHandWashVariant(p.name));

  const getVarietiesForProduct = (productName: string) => {
    if (productName === "BIO AIR FRESHENER") return airFreshenerVariants;
    if (productName === "BIO HANDWASH") return handWashVariants;
    return [];
  }

  const getCleanVariantName = (variantName: string, productName: string) => {
    if (productName === "BIO AIR FRESHENER") {
      return variantName.replace(/Bio\s+Air\s+Freshe?ner\s*[-–]*\s*/i, '');
    }
    if (productName === "BIO HANDWASH") {
      return variantName.replace(/Bio\s+Hand\s+Wash\s*[-–]*\s*/i, '');
    }
    return variantName;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Product Catalog</h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full bg-bg-main border-border-subtle focus-visible:ring-1 focus-visible:ring-text-brand"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-fit flex items-center gap-2 border-border-subtle bg-bg-main">
                <Filter className="w-4 h-4" />
                Categories
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-[10px]">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-bg-card border-border-subtle shadow-md">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-subtle" />
              {CATEGORIES.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Product Grid */}
      <main className="w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-24 text-muted-foreground">
            Loading products...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-24 text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
            {filteredProducts.map((product) => (
              <Dialog key={product.id}>
                <DialogTrigger asChild>
                  <Card className="w-full overflow-hidden transition-all hover:shadow-md cursor-pointer border-border-subtle flex flex-row min-h-[200px] max-h-[300px]">
                    {/* Left side: Tall Image Placeholder */}
                    <div className="relative w-[35%] min-w-[120px] max-w-[200px] bg-bg-hover flex items-center justify-center p-6 border-r border-border-subtle transition-colors shrink-0">
                      {product.product_media && product.product_media.length > 0 ? (
                        <Image
                          src={product.product_media[0].media_url}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-text-muted" strokeWidth={1} />
                      )}
                    </div>

                    {/* Right side: Product Data */}
                    <CardContent className="p-6 flex flex-col justify-center flex-1 overflow-hidden">
                      {/* Category */}
                      {product.category && (
                        <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block truncate">
                          {product.category}
                        </span>
                      )}

                      {/* Product Name */}
                      <div className="mb-2 shrink-0">
                        <h3 className="font-extrabold text-xl md:text-2xl text-text-main leading-tight pr-2">
                          {product.name}
                        </h3>
                      </div>

                      {/* Product USP */}
                      {product.usp ? (
                        <p className="text-sm text-text-muted mt-2 line-clamp-4 leading-relaxed font-medium">
                          {product.usp}
                        </p>
                      ) : (
                        <p className="text-sm text-text-meta italic mt-2">
                          No USP detailed for this product.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-bg-card gap-0 border-border-subtle">
                  <div className="flex flex-col md:flex-row max-h-[85vh]">
                    {/* Dialog Left: Large Image & Varieties */}
                    {getVarietiesForProduct(product.name).length > 0 ? (
                      <div className="w-full md:w-[45%] bg-bg-hover flex flex-col p-8 shrink-0 border-b md:border-b-0 md:border-r border-border-subtle overflow-y-auto">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="w-full h-[350px] flex items-center justify-center shrink-0 mb-6 bg-transparent cursor-pointer hover:opacity-80 transition-opacity">
                              {product.product_media && product.product_media.length > 0 ? (
                                <img
                                  src={product.product_media[0].media_url}
                                  alt={product.name}
                                  className="w-full h-full object-contain filter drop-shadow-md"
                                />
                              ) : (
                                <Package className="w-32 h-32 text-text-muted" strokeWidth={1} />
                              )}
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-8 bg-bg-card border-border-subtle rounded-xl flex flex-col items-center">
                            <DialogHeader className="text-center w-full mb-6">
                              <DialogTitle className="text-3xl font-extrabold text-text-main">
                                {product.name}
                              </DialogTitle>
                              <DialogDescription className="sr-only">Larger view of {product.name}</DialogDescription>
                            </DialogHeader>
                            <div className="relative w-full h-[600px] flex items-center justify-center">
                              {product.product_media && product.product_media.length > 0 ? (
                                <img src={product.product_media[0].media_url} alt={product.name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                              ) : (
                                <Package className="w-48 h-48 mx-auto text-text-muted" />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <div className="w-full mt-6 shrink-0">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4 border-b border-border-subtle pb-2">Varieties</h4>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {getVarietiesForProduct(product.name).map(variant => (
                              <Dialog key={variant.id}>
                                <DialogTrigger asChild>
                                  <div className="flex flex-col items-center justify-between bg-bg-card p-3 rounded-lg border border-border-subtle shadow-sm cursor-pointer hover:border-text-brand transition-all">
                                    <div className="relative w-full h-16 mb-2 flex-shrink-0">
                                      {variant.product_media && variant.product_media.length > 0 ? (
                                        <Image src={variant.product_media[0].media_url} alt={variant.name} fill className="object-contain drop-shadow-sm" />
                                      ) : (
                                        <Package className="w-6 h-6 mx-auto text-text-muted" />
                                      )}
                                    </div>
                                    <span className="text-[11px] font-bold text-center text-text-main leading-snug line-clamp-2">
                                      {getCleanVariantName(variant.name, product.name)}
                                    </span>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl p-8 bg-bg-card border-border-subtle rounded-xl flex flex-col items-center">
                                  <DialogHeader className="text-center w-full mb-6">
                                    <DialogTitle className="text-3xl font-extrabold text-text-main">
                                      {getCleanVariantName(variant.name, product.name)}
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">Larger view of {variant.name}</DialogDescription>
                                  </DialogHeader>
                                  <div className="relative w-full h-[500px] flex items-center justify-center">
                                    {variant.product_media && variant.product_media.length > 0 ? (
                                      <img src={variant.product_media[0].media_url} alt={variant.name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                                    ) : (
                                      <Package className="w-48 h-48 mx-auto text-text-muted" />
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative w-full md:w-[45%] bg-bg-hover flex items-center justify-center p-8 shrink-0 min-h-[400px] border-b md:border-b-0 md:border-r border-border-subtle cursor-pointer hover:opacity-90 transition-opacity">
                            {product.product_media && product.product_media.length > 0 ? (
                              <Image
                                src={product.product_media[0].media_url}
                                alt={product.name}
                                fill
                                className="object-contain p-8 drop-shadow-md"
                              />
                            ) : (
                              <Package className="w-32 h-32 text-text-muted" strokeWidth={1} />
                            )}
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-8 bg-bg-card border-border-subtle rounded-xl flex flex-col items-center">
                          <DialogHeader className="text-center w-full mb-6">
                            <DialogTitle className="text-3xl font-extrabold text-text-main">
                              {product.name}
                            </DialogTitle>
                            <DialogDescription className="sr-only">Larger view of {product.name}</DialogDescription>
                          </DialogHeader>
                          <div className="relative w-full h-[600px] flex items-center justify-center">
                            {product.product_media && product.product_media.length > 0 ? (
                              <img src={product.product_media[0].media_url} alt={product.name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                            ) : (
                              <Package className="w-48 h-48 mx-auto text-text-muted" />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Dialog Right: Scrollable Content */}
                    <div className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
                      <DialogHeader className="mb-8 text-left space-y-2">
                        {product.category && (
                          <span className="text-xs font-bold tracking-widest uppercase text-primary block">
                            {product.category}
                          </span>
                        )}
                        <DialogTitle className="text-3xl md:text-4xl font-extrabold text-text-main leading-tight">
                          {product.name}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Detailed capabilities, applications, and guidelines for {product.name}
                        </DialogDescription>
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <span className="inline-block text-xs font-mono bg-bg-hover text-text-muted px-3 py-1.5 rounded-md border border-border-subtle">
                            SKU: {product.sku}
                          </span>
                          {product.ph_level !== null && (
                            <span className="inline-block text-xs font-bold font-mono bg-brand-accent/10 text-text-brand border border-brand-accent/20 px-3 py-1.5 rounded-md">
                              pH Level {product.ph_level}
                            </span>
                          )}
                        </div>
                      </DialogHeader>

                      <div className="space-y-8 text-sm text-text-main">
                        {product.description && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Description</h4>
                            <p className="leading-relaxed text-base">{product.description}</p>
                          </div>
                        )}
                        {product.features_benefits && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Features & Benefits</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.features_benefits}</p>
                          </div>
                        )}
                        {product.applications && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Applications</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.applications}</p>
                          </div>
                        )}
                        {product.directions_to_use && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Directions for Use</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.directions_to_use}</p>
                          </div>
                        )}
                        {product.ingredients && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Ingredients</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.ingredients}</p>
                          </div>
                        )}
                        {product.documents && product.documents.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 border-b border-border-subtle pb-2">Available Documents</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {product.documents.map((doc) => (
                                <div key={doc.id} className="flex flex-col gap-2 p-3 rounded-lg bg-bg-hover border border-border-subtle transition-colors">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-text-brand shrink-0" />
                                    <span className="text-sm font-medium line-clamp-1 flex-1">{doc.title}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <Badge variant="outline" className="text-[10px] leading-none py-0.5 px-1.5 font-mono border-border-subtle h-auto text-text-muted">
                                      {doc.category}
                                    </Badge>
                                    <ShareDocumentButton documentId={doc.id} title={doc.title} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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

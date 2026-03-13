"use client"

import React, { useState, useEffect } from "react"
import { createProduct, createTrainingModule, createAnnouncement, getProducts } from "../../actions/admin"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

const REGIONS = ["GLOBAL", "UAE", "KSA", "North America", "Russia", "India"]
const CATEGORIES = ["Hardware", "Software", "Services", "Accessories", "Cleaning", "Polishing", "Maintenance", "Restoration"]

export default function AdminCMSPage() {
  // SKU Form State
  const [skuId, setSkuId] = useState("")
  const [skuName, setSkuName] = useState("")
  const [skuCategory, setSkuCategory] = useState("")
  const [phLevel, setPhLevel] = useState("")
  const [isCreatingSku, setIsCreatingSku] = useState(false)

  // Document Form State
  const [docProductId, setDocProductId] = useState("general")
  const [docTitle, setDocTitle] = useState("")
  const [docCategory, setDocCategory] = useState("TDS")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])

  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Product Media State
  const [mediaProductId, setMediaProductId] = useState("")
  const [mediaType, setMediaType] = useState("Before")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  // Training Module State
  const [trainTitle, setTrainTitle] = useState("")
  const [trainDescription, setTrainDescription] = useState("")
  const [trainVideoUrl, setTrainVideoUrl] = useState("")
  const [trainPdfUrl, setTrainPdfUrl] = useState("")
  const [trainCategory, setTrainCategory] = useState("Sales")
  const [trainMarketSegment, setTrainMarketSegment] = useState("Hospitality")
  const [isCreatingTraining, setIsCreatingTraining] = useState(false)

  // Announcement State
  const [annTitle, setAnnTitle] = useState("")
  const [annContent, setAnnContent] = useState("")
  const [annAttachmentUrl, setAnnAttachmentUrl] = useState("")
  const [annIsPinned, setAnnIsPinned] = useState(false)
  const [isCreatingAnn, setIsCreatingAnn] = useState(false)

  // Products Data
  const [products, setProducts] = useState<{ id: string, name: string, sku: string }[]>([])

  useEffect(() => {
    async function fetchProducts() {
      const res = await getProducts()
      if (res.success && res.data) {
        setProducts(res.data)
      }
    }
    fetchProducts()
  }, [])

  const handleCreateSKU = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!skuId || !skuName || !skuCategory) return

    setIsCreatingSku(true)

    const formData = new FormData()
    formData.append("sku", skuId)
    formData.append("name", skuName)
    formData.append("category", skuCategory)
    // Server action expects parsing ph_level
    if (phLevel) formData.append("ph_level", phLevel)

    const result = await createProduct(formData)

    if (result.success) {
      alert(`SKU created successfully: ${skuId}`)
      setSkuId("")
      setSkuName("")
      setSkuCategory("")
      setPhLevel("")
    } else {
      alert(`Error creating SKU: ${result.error}`)
    }

    setIsCreatingSku(false)
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions(curr =>
      curr.includes(region)
        ? curr.filter(r => r !== region)
        : [...curr, region]
    )
    if (uploadError) setUploadError(null)
  }

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documentFile) {
      setUploadError("Please select a file to upload.")
      return
    }

    if (selectedRegions.length === 0) {
      setUploadError("You must select at least one valid region before uploading.")
      return
    }

    if (!docTitle || !docCategory) {
      setUploadError("Please fill out all document details.")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", documentFile)
      formData.append("product_id", docProductId)
      formData.append("title", docTitle)
      formData.append("category", docCategory)
      selectedRegions.forEach(region => formData.append("valid_regions", region))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document')
      }

      alert(`Document uploaded successfully for regions: ${selectedRegions.join(", ")}`)

      // Reset form
      setDocProductId("general")
      setDocTitle("")
      setDocumentFile(null)
      setSelectedRegions([])
      // Keep category as user likely uploads multiples of same type

    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaProductId || !mediaFile) return
    setIsUploadingMedia(true)
    // Map to future server action
    console.log("Uploading Product Media", { mediaProductId, mediaType, mediaFile })
    alert(`Product ${mediaType} media uploaded successfully (Mock)`)
    setMediaProductId("")
    setMediaFile(null)
    setIsUploadingMedia(false)
  }

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trainTitle || !trainVideoUrl) return
    setIsCreatingTraining(true)

    const formData = new FormData()
    formData.append("title", trainTitle)
    formData.append("description", trainDescription)
    formData.append("video_url", trainVideoUrl)
    formData.append("pdf_url", trainPdfUrl)
    formData.append("category", trainCategory)
    formData.append("market_segment", trainMarketSegment)

    const result = await createTrainingModule(formData)
    if (result.success) {
      alert("Training module created successfully")
      setTrainTitle("")
      setTrainDescription("")
      setTrainVideoUrl("")
      setTrainPdfUrl("")
    } else {
      alert(`Error creating training module: ${result.error}`)
    }

    setIsCreatingTraining(false)
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle || !annContent) return
    setIsCreatingAnn(true)

    const formData = new FormData()
    formData.append("title", annTitle)
    formData.append("content", annContent)
    if (annAttachmentUrl) formData.append("attachment_url", annAttachmentUrl)
    formData.append("is_pinned", annIsPinned ? "true" : "false")

    const result = await createAnnouncement(formData)
    if (result.success) {
      alert("Announcement created successfully")
      setAnnTitle("")
      setAnnContent("")
      setAnnAttachmentUrl("")
      setAnnIsPinned(false)
    } else {
      alert(`Error creating announcement: ${result.error}`)
    }

    setIsCreatingAnn(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Content Management System</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage product SKUs and upload region-specific hub documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Create SKU Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleCreateSKU}>
            <CardHeader>
              <CardTitle>Create New SKU</CardTitle>
              <CardDescription>
                Add a new product entry to the catalog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skuId">SKU ID</Label>
                  <Input
                    id="skuId"
                    placeholder="e.g. VK-100"
                    value={skuId}
                    onChange={(e) => setSkuId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phLevel">pH Level (Optional)</Label>
                  <Input
                    id="phLevel"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    placeholder="e.g. 7.5"
                    value={phLevel}
                    onChange={(e) => setPhLevel(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skuName">Product Name</Label>
                <Input
                  id="skuName"
                  placeholder="e.g. Veritas Heavy Duty Cleaner"
                  value={skuName}
                  onChange={(e) => setSkuName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skuCategory">Category</Label>
                <Select value={skuCategory} onValueChange={setSkuCategory} required>
                  <SelectTrigger id="skuCategory">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isCreatingSku}>
                {isCreatingSku ? "Creating..." : "Create SKU"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Upload Document Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleUploadDocument}>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload marketing, technical, or sales material. Forced region selection ensures compliant distribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="docProductId">Target Product</Label>
                  <Select value={docProductId} onValueChange={setDocProductId} required>
                    <SelectTrigger id="docProductId">
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">None (General Document)</SelectItem>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docCategory">Doc Category</Label>
                  <Select value={docCategory} onValueChange={setDocCategory} required>
                    <SelectTrigger id="docCategory">
                      <SelectValue placeholder="TDS, MSDS, etc." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TDS">TDS (Technical Data)</SelectItem>
                      <SelectItem value="MSDS">MSDS (Safety Data)</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docTitle">Document Title</Label>
                <Input
                  id="docTitle"
                  placeholder="e.g. NA Market Safety Guidelines 2026"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="docFile">File</Label>
                <Input
                  id="docFile"
                  type="file"
                  className="cursor-pointer"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-3">
                <Label>Valid Regions (Required)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={selectedRegions.includes(region)}
                        onCheckedChange={() => toggleRegion(region)}
                      />
                      <label
                        htmlFor={`region-${region}`}
                        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500 font-medium mt-2">{uploadError}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" variant="secondary" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload to Selected Regions"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Add Product Media Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleUploadMedia}>
            <CardHeader>
              <CardTitle>Add Product Media</CardTitle>
              <CardDescription>
                Upload visual media like Before/After images for a product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mediaProductId">Target Product</Label>
                <Select value={mediaProductId} onValueChange={setMediaProductId} required>
                  <SelectTrigger id="mediaProductId">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediaType">Media Type</Label>
                <Select value={mediaType} onValueChange={setMediaType} required>
                  <SelectTrigger id="mediaType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Before">Before Image</SelectItem>
                    <SelectItem value="After">After Image</SelectItem>
                    <SelectItem value="Default">Default Product Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediaFile">Image File</Label>
                <Input
                  id="mediaFile"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" variant="outline" disabled={isUploadingMedia}>
                {isUploadingMedia ? "Uploading..." : "Upload Media"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Create Training Module Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleCreateTraining}>
            <CardHeader>
              <CardTitle>Create Training Module</CardTitle>
              <CardDescription>
                Publish new educational content to the Training Hub.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainCategory">Category</Label>
                  <Select value={trainCategory} onValueChange={setTrainCategory} required>
                    <SelectTrigger id="trainCategory">
                      <SelectValue placeholder="Category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Application">Application</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainMarketSegment">Market Segment</Label>
                  <Select value={trainMarketSegment} onValueChange={setTrainMarketSegment} required>
                    <SelectTrigger id="trainMarketSegment">
                      <SelectValue placeholder="Segment..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospitality">Hospitality</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="F&B">F&B</SelectItem>
                      <SelectItem value="JanSan">JanSan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainTitle">Module Title</Label>
                <Input
                  id="trainTitle"
                  placeholder="e.g. Advanced Cleaning Techniques"
                  value={trainTitle}
                  onChange={(e) => setTrainTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainDescription">Description</Label>
                <Textarea
                  id="trainDescription"
                  placeholder="Short summary of this training video..."
                  value={trainDescription}
                  onChange={(e) => setTrainDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainVideoUrl">Video URL</Label>
                <Input
                  id="trainVideoUrl"
                  type="url"
                  placeholder="https://vimeo.com/..."
                  value={trainVideoUrl}
                  onChange={(e) => setTrainVideoUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainPdfUrl">PDF Resource URL (Optional)</Label>
                <Input
                  id="trainPdfUrl"
                  type="url"
                  placeholder="https://.../deck.pdf"
                  value={trainPdfUrl}
                  onChange={(e) => setTrainPdfUrl(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isCreatingTraining}>
                {isCreatingTraining ? "Creating..." : "Publish Training Module"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Create Announcement Form */}
        <Card className="shadow-sm md:col-span-2 xl:col-span-1">
          <form onSubmit={handleCreateAnnouncement}>
            <CardHeader>
              <CardTitle>Broadcast Announcement</CardTitle>
              <CardDescription>
                Publish news to the main dashboard for all partners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annTitle">Title</Label>
                <Input
                  id="annTitle"
                  placeholder="e.g. Q4 Price Adjustments"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annContent">Message Content</Label>
                <Textarea
                  id="annContent"
                  placeholder="Detailed announcement text..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annAttachmentUrl">Attachment URL (Optional)</Label>
                <Input
                  id="annAttachmentUrl"
                  type="url"
                  placeholder="https://.../annex.pdf"
                  value={annAttachmentUrl}
                  onChange={(e) => setAnnAttachmentUrl(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="annIsPinned"
                  checked={annIsPinned}
                  onCheckedChange={(checked) => setAnnIsPinned(checked === true)}
                />
                <label
                  htmlFor="annIsPinned"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Pin to top of Dashboard
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isCreatingAnn}>
                {isCreatingAnn ? "Publishing..." : "Broadcast Announcement"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

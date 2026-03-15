"use client" // Trigger reload

import { useState, useEffect } from "react"
import { FileText, Search, Database } from "lucide-react"
import { getAllDocuments } from "@/app/dashboard/actions/document"
import { ShareDocumentButton } from "@/components/ShareDocumentButton"
import { Input } from "@/components/ui/input"

type Document = {
    id: string
    title: string
    category: string
    products?: { name: string; sku: string } | null
}

export default function AssetLibraryPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function fetchDocs() {
            setIsLoading(true)
            const { success, data } = await getAllDocuments()
            if (success && data) {
                setDocuments(data as Document[])
            }
            setIsLoading(false)
        }
        fetchDocs()
    }, [])

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.products?.name && doc.products.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-bg-main border-border-subtle text-text-main" style={{ borderColor: '#243018' }}>
            <div className="flex flex-col gap-1">
                <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase">Global Repository</h2>
                <h1 className="text-3xl font-extrabold tracking-tight text-text-main mb-2">Documents</h1>
                <p className="text-text-muted">Search and retrieve Technical Data Sheets (TDS), MSDS, and specific product literature approved for your region.</p>
            </div>

            <div className="flex items-center gap-4 bg-bg-card border border-border-subtle p-4 rounded-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                        placeholder="Search documents by title, product name, or category..."
                        className="w-full pl-10 bg-bg-main border-border-subtle text-text-main focus-visible:ring-[#6abf30] focus-visible:border-brand-accent h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-accent/10 rounded-lg">
                            <Database className="w-5 h-5 text-brand-accent" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-text-main">Central Index</h3>
                            <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">All Downloadable Content</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold bg-bg-main text-brand-accent px-3 py-1.5 rounded-full border border-brand-accent/20">
                        {filteredDocs.length} FILES FOUND
                    </span>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="py-24 flex justify-center items-center">
                            <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="py-24 text-center">
                            <FileText className="w-12 h-12 text-[#243018] mx-auto mb-4" />
                            <p className="text-sm font-bold tracking-wide text-text-meta uppercase">No documents found matching your search</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#243018]">
                            {filteredDocs.map((doc) => (
                                <div key={doc.id} className="p-4 sm:p-6 hover:bg-bg-hover/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-bg-main rounded-xl border border-border-subtle shrink-0 mt-1 sm:mt-0">
                                            <FileText className="w-6 h-6 text-brand-accent" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-text-main tracking-wide">{doc.title}</h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-[10px] font-bold tracking-widest uppercase bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded border border-brand-accent/20">
                                                    {doc.category}
                                                </span>
                                                {doc.products && (
                                                    <>
                                                        <span className="text-text-meta text-xs">•</span>
                                                        <span className="text-xs font-semibold text-text-muted tracking-wide">
                                                            Related: {doc.products.name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center justify-start sm:justify-end border-t border-border-subtle mt-4 pt-4 sm:border-0 sm:mt-0 sm:pt-0 w-full sm:w-auto">
                                        <ShareDocumentButton documentId={doc.id} title={doc.title} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

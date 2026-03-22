import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { deleteProducts } from "@/app/dashboard/actions/admin"
import { EditableProduct } from "./EditProductModal"

export function DeleteProductModal({ products, onSuccess }: { products: EditableProduct[], onSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleDelete = async () => {
        if (selectedIds.length === 0) return

        if (!confirm(`Are you sure you want to completely delete ${selectedIds.length} product(s)?`)) return

        setIsDeleting(true)
        const res = await deleteProducts(selectedIds)

        if (res.success) {
            alert(`Successfully deleted ${selectedIds.length} product(s).`)
            setIsOpen(false)
            onSuccess()
        } else {
            alert(`Error deleting products: ${res.error}`)
        }
        setIsDeleting(false)
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) setSelectedIds([])
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-fit flex items-center gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 bg-bg-main" title="Delete Products">
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-6 bg-bg-card border-border-subtle max-h-[85vh] flex flex-col">
                <DialogHeader className="mb-4 shrink-0">
                    <DialogTitle className="text-2xl font-bold text-red-500">Delete Products</DialogTitle>
                    <p className="text-sm text-text-muted mt-1">Select one or more products to permanently remove from the catalog.</p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 border border-border-subtle rounded-md p-2 bg-bg-main mb-4">
                    {products.length === 0 ? (
                        <p className="p-4 text-center text-text-muted text-sm">No products available to delete.</p>
                    ) : (
                        products.map(p => (
                            <div key={p.id} className="flex items-center space-x-3 p-2 hover:bg-bg-hover rounded-md transition-colors cursor-pointer" onClick={() => toggleSelection(p.id)}>
                                <Checkbox
                                    checked={selectedIds.includes(p.id)}
                                    onCheckedChange={() => toggleSelection(p.id)}
                                    // Stop propagation so clicking box doesn't double-fire div onClick
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-text-main">{p.name} <span className="text-text-muted font-normal text-xs ml-2">({p.sku})</span></span>
                                    <span className="text-[10px] text-text-meta uppercase tracking-wider">{p.category || 'NO CATEGORY'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="shrink-0 flex justify-between items-center pt-4 border-t border-border-subtle">
                    <span className="text-sm font-medium text-text-muted">
                        {selectedIds.length} selected
                    </span>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || selectedIds.length === 0}
                        className="gap-2"
                    >
                        {isDeleting ? "Deleting..." : "Permanently Delete"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

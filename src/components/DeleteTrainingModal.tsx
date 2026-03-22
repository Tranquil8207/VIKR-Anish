import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { deleteTrainingModules } from "@/app/dashboard/actions/admin"
import { EditableTraining } from "./EditTrainingModal"

export function DeleteTrainingModal({ videos, onSuccess }: { videos: EditableTraining[], onSuccess: () => void }) {
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

        if (!confirm(`Are you sure you want to completely delete ${selectedIds.length} training video(s)?`)) return

        setIsDeleting(true)
        const res = await deleteTrainingModules(selectedIds)

        if (res.success) {
            alert(`Successfully deleted ${selectedIds.length} training video(s).`)
            setIsOpen(false)
            onSuccess()
        } else {
            alert(`Error deleting training videos: ${res.error}`)
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
                <Button variant="outline" className="w-fit flex items-center gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 bg-bg-main" title="Delete Training Videos">
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-6 bg-bg-card border-border-subtle max-h-[85vh] flex flex-col">
                <DialogHeader className="mb-4 shrink-0">
                    <DialogTitle className="text-2xl font-bold text-red-500">Delete Training Modules</DialogTitle>
                    <p className="text-sm text-text-muted mt-1">Select one or more training videos to permanently remove from the Training Hub.</p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 border border-border-subtle rounded-md p-2 bg-bg-main mb-4">
                    {videos.length === 0 ? (
                        <p className="p-4 text-center text-text-muted text-sm">No training videos available to delete.</p>
                    ) : (
                        videos.map(v => (
                            <div key={v.id} className="flex items-center space-x-3 p-2 hover:bg-bg-hover rounded-md transition-colors cursor-pointer" onClick={() => toggleSelection(v.id)}>
                                <Checkbox
                                    checked={selectedIds.includes(v.id)}
                                    onCheckedChange={() => toggleSelection(v.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-text-main">{v.title}</span>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-[10px] text-text-brand border border-brand-accent/30 bg-brand-accent/5 px-1 py-0.5 rounded uppercase tracking-wider">{v.category}</span>
                                        <span className="text-[10px] text-text-meta uppercase tracking-wider">{v.market_segment}</span>
                                    </div>
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

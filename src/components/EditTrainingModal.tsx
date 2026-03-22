import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { updateTrainingModule } from "@/app/dashboard/actions/admin"

export type EditableTraining = {
    id: string
    title: string
    description: string | null
    video_url: string
    duration_seconds: number | null
    category: string | null
    market_segment: string | null
    pdf_resource_url: string | null
    created_at?: string
    youtube_video_id?: string
}

export function EditTrainingModal({ videos, onSuccess }: { videos: EditableTraining[], onSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedVideoId, setSelectedVideoId] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)

    // Local state for the selected training form
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const [durationSeconds, setDurationSeconds] = useState("")
    const [pdfUrl, setPdfUrl] = useState("")
    const [category, setCategory] = useState("")
    const [marketSegment, setMarketSegment] = useState("")

    // When dropdown changes, populate states
    const handleSelect = (id: string) => {
        setSelectedVideoId(id)
        const active = videos.find(v => v.id === id)
        if (active) {
            setTitle(active.title || "")
            setDescription(active.description || "")
            setVideoUrl(active.video_url || "")
            setDurationSeconds(active.duration_seconds !== null ? String(active.duration_seconds) : "")
            setPdfUrl(active.pdf_resource_url || "")
            setCategory(active.category || "")
            setMarketSegment(active.market_segment || "")
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedVideoId || !title || !videoUrl) return
        setIsSaving(true)

        const formData = new FormData()
        formData.append("id", selectedVideoId)
        formData.append("title", title)
        formData.append("description", description)
        formData.append("video_url", videoUrl)
        if (durationSeconds) formData.append("duration_seconds", durationSeconds)
        formData.append("pdf_url", pdfUrl)
        formData.append("category", category)
        formData.append("market_segment", marketSegment)

        const res = await updateTrainingModule(formData)

        if (res.success) {
            alert("Training video updated successfully")
            setIsOpen(false)
            onSuccess()
        } else {
            alert(`Error updating training video: ${res.error}`)
        }
        setIsSaving(false)
    }

    // Effect to clean up form when opening new dialog
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) setSelectedVideoId("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-fit flex items-center gap-2 border-border-subtle bg-bg-main" title="Edit Training Video">
                    <Pencil className="w-4 h-4" />
                    Edit Video
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-6 bg-bg-card border-border-subtle max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold">Edit Training Video</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="videoSelect">Select a Video to Edit</Label>
                        <Select value={selectedVideoId} onValueChange={handleSelect}>
                            <SelectTrigger id="videoSelect">
                                <SelectValue placeholder="Choose a training module..." />
                            </SelectTrigger>
                            <SelectContent>
                                {videos.map(v => (
                                    <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedVideoId && (
                        <form onSubmit={handleUpdate} className="space-y-6 pt-4 border-t border-border-subtle">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="trainCategory">Category</Label>
                                    <Select value={category} onValueChange={setCategory} required>
                                        <SelectTrigger id="trainCategory">
                                            <SelectValue placeholder="Category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sales">Sales</SelectItem>
                                            <SelectItem value="Industries">Industries</SelectItem>
                                            <SelectItem value="Onboarding">Onboarding</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trainMarketSegment">Market Segment</Label>
                                    <Select value={marketSegment} onValueChange={setMarketSegment} required>
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
                                <Input id="trainTitle" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="trainDescription">Description</Label>
                                <Textarea id="trainDescription" className="min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="trainVideoUrl">YouTube Video URL</Label>
                                    <Input id="trainVideoUrl" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trainDuration">Duration (Seconds)</Label>
                                    <Input id="trainDuration" type="number" min="0" value={durationSeconds} onChange={e => setDurationSeconds(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="trainPdfUrl">PDF Resource URL (Optional)</Label>
                                <Input id="trainPdfUrl" type="url" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} />
                            </div>

                            <Button type="submit" variant="default" className="w-full" disabled={isSaving}>
                                {isSaving ? "Saving details..." : "Save Training Video Details"}
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSecureDocumentUrl } from '@/app/dashboard/actions/document'

interface ShareDocumentButtonProps {
  documentId: string
  title: string
}

export function ShareDocumentButton({ documentId, title }: ShareDocumentButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      // Get a 24-hour expiring link (86400 seconds)
      const { success, url, error } = await getSecureDocumentUrl(documentId, 86400)

      if (!success || !url) {
        alert(error || 'Failed to generate secure link.')
        return
      }

      const shareData = {
        title: `VIKR Document: ${title}`,
        text: `Here is the requested document: ${title}. Note: This secure link will expire in 24 hours.`,
        url: url,
      }

      // Check if Web Share API is available (usually mobile devices)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard for desktop
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        alert('Secure link copied to clipboard! (Expires in 24 hours)')
      }
    } catch (err) {
      console.error('Error sharing document:', err)
      alert('An error occurred while trying to share the document.')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleShare} 
      disabled={isSharing}
      className="flex items-center gap-2"
    >
      <Share2 className="w-4 h-4" />
      {isSharing ? 'Generating...' : 'Share (24h Limit)'}
    </Button>
  )
}

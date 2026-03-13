"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPartners, updatePartnerTerritory, createPartner, resetPartnerPassword } from "../../actions/admin"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database } from "@/types/supabase"

type Territory = Database['public']['Enums']['territory']
const TERRITORIES: Territory[] = ["GLOBAL", "UAE", "KSA", "North America", "Russia", "India"]

interface UserProfile {
  id: string
  territory_code: Territory
  is_admin: boolean | null
  email?: string // Optional, as it might not be in the profiles table directly
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | "">("")
  const [isSaving, setIsSaving] = useState(false)

  const [isCreating, setIsCreating] = useState(false)
  const [isSubmittingNew, setIsSubmittingNew] = useState(false)

  const [resetUser, setResetUser] = useState<UserProfile | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isResetting, setIsResetting] = useState(false)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    const result = await getPartners()
    if (result.success && result.data) {
      setUsers(result.data as UserProfile[])
    } else {
      setError(result.error || "Failed to fetch users")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers()
  }, [])

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user)
    setSelectedTerritory(user.territory_code)
  }

  const handleSave = async () => {
    if (!editingUser || !selectedTerritory) return

    setIsSaving(true)

    // Server action call
    const result = await updatePartnerTerritory(editingUser.id, selectedTerritory as Territory)

    if (result.success) {
      // Optimistic update
      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, territory_code: selectedTerritory as Territory } : u
      ))
      setEditingUser(null)
    } else {
      alert(`Error updating territory: ${result.error}`)
    }

    setIsSaving(false)
  }

  const handleCreatePartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingNew(true)

    const formData = new FormData(e.currentTarget)
    const result = await createPartner(formData)

    if (result.success) {
      setIsCreating(false)
      // router.refresh() forces Next.js to re-fetch from the server,
      // clearing any cached data so the new row appears immediately
      router.refresh()
      await fetchUsers()
    } else {
      alert(`Error creating partner: ${result.error}`)
    }

    setIsSubmittingNew(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetUser) return
    setIsResetting(true)

    const result = await resetPartnerPassword(resetUser.id, newPassword)

    if (result.success) {
      setResetUser(null)
      setNewPassword("")
    } else {
      alert(`Error resetting password: ${result.error}`)
    }

    setIsResetting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Access Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage partner hub users and their regional access permissions.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-[#0ABFBC] hover:bg-[#09aba8] text-[#052b2a] font-bold">
          + New Partner
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200 w-[300px]">Email</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Role</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Territory</TableHead>
              <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No partners found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <TableCell className="text-sm">{user.email ?? <span className="text-muted-foreground font-mono text-xs">{user.id.substring(0, 8)}…</span>}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Admin</Badge>
                    ) : (
                      <Badge variant="outline">Partner</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.territory_code === "UAE" ? "default" : "outline"} className="font-mono">
                      {user.territory_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(user)} disabled={user.is_admin === true}>
                        Edit Access
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setResetUser(user); setNewPassword("") }}
                        disabled={user.is_admin === true}
                        className="border-[#FF4C4C]/30 text-[#FF4C4C] hover:bg-[#FF4C4C]/10 hover:text-[#FF4C4C]"
                      >
                        Reset PWD
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && !isSaving && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Access</DialogTitle>
            <DialogDescription>
              Change territory permissions for {editingUser?.id.substring(0, 8)}... They will be granted access to resources corresponding to this region.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="territory" className="text-right text-sm font-medium">
                Territory
              </label>
              <div className="col-span-3">
                <Select value={selectedTerritory} onValueChange={(val) => setSelectedTerritory(val as Territory)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {TERRITORIES.map(t => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !selectedTerritory}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onOpenChange={(open) => !open && !isResetting && (setResetUser(null), setNewPassword(""))}>
        <DialogContent className="sm:max-w-[400px] bg-[#131720] border-[#1E2330] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reset Partner Password</DialogTitle>
            <DialogDescription className="text-[#8F9BB3]">
              Force-set a new password for <span className="text-[#0ABFBC] font-semibold">{resetUser?.email}</span>. No email confirmation required — share the new password directly with the partner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reset_password" className="text-[10px] uppercase tracking-widest text-[#8F9BB3] font-bold">
                  New Password
                </Label>
                <Input
                  id="reset_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="bg-[#0B0C10] border-[#1E2330] text-white focus-visible:ring-[#0ABFBC] focus-visible:border-[#0ABFBC]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setResetUser(null); setNewPassword("") }} disabled={isResetting} className="border-[#1E2330]">
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting || newPassword.length < 6} className="bg-[#FF4C4C] hover:bg-[#e04444] text-white font-bold">
                {isResetting ? "Resetting..." : "Force Reset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreating} onOpenChange={(open) => !open && !isSubmittingNew && setIsCreating(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Partner</DialogTitle>
            <DialogDescription>
              Create a new account that bypasses email confirmation. The credentials can be shared directly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePartner}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Partner Name"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="partner@example.com"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="col-span-3"
                  required
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_territory" className="text-right text-sm font-medium">
                  Territory
                </Label>
                <div className="col-span-3">
                  <Select name="territory_code" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign a territory" />
                    </SelectTrigger>
                    <SelectContent>
                      {TERRITORIES.map(t => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)} disabled={isSubmittingNew}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingNew} className="bg-[#0ABFBC] hover:bg-[#09aba8] text-[#052b2a] font-bold">
                {isSubmittingNew ? "Creating..." : "Create Partner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

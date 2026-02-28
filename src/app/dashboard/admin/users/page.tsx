"use client"

import React, { useState, useEffect } from "react"
import { getPartners, updatePartnerTerritory } from "../../actions/admin"
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
import { Database } from "@/types/supabase"

type Territory = Database['public']['Enums']['territory']
const TERRITORIES: Territory[] = ["GLOBAL", "MENA", "APAC", "EU", "NA", "LATAM", "AFRICA"]

interface UserProfile {
  id: string
  territory_code: Territory
  is_admin: boolean | null
  email?: string // Optional, as it might not be in the profiles table directly
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | "">("")
  const [isSaving, setIsSaving] = useState(false)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Access Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage partner hub users and their regional access permissions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200 w-[300px]">Profile ID</TableHead>
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
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>
                     {user.is_admin ? (
                       <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Admin</Badge>
                     ) : (
                       <Badge variant="outline">Partner</Badge>
                     )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.territory_code === "GLOBAL" ? "default" : "outline"} className="font-mono">
                      {user.territory_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)} disabled={user.is_admin === true}>
                      Edit Access
                    </Button>
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
              Change territory permissions for {editingUser?.id.substring(0,8)}... They will be granted access to resources corresponding to this region.
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
    </div>
  )
}

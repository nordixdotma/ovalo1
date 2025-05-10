"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Mail, Shield, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

import { users as initialUsers } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageAnimation } from "@/components/page-animation"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSort } from "@/hooks/use-sort"
import { SortableHeader } from "@/components/sortable-header"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function UsersPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState(initialUsers)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; userId: string; userName: string }>({
    isOpen: false,
    userId: "",
    userName: "",
  })
  const { toast } = useToast()

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredUsers, { column: "fullName", direction: "asc" })

  // Helper function to get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100" variant="secondary">
            <Shield className="mr-1 h-3 w-3" />
            {t("users", "admin", language)}
          </Badge>
        )
      case "Editor":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <Edit className="mr-1 h-3 w-3" />
            {t("users", "editor", language)}
          </Badge>
        )
      case "Viewer":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            {t("users", "viewer", language)}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("users", "active", language)}
          </Badge>
        )
      case "invited":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            <Mail className="mr-1 h-3 w-3" />
            {t("users", "invited", language)}
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t("users", "inactive", language)}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteDialog({
      isOpen: true,
      userId,
      userName,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the user from the state
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteDialog.userId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, userId: "", userName: "" })

    // Show success toast
    toast({
      title: t("users", "userDeleted", language),
      description: t("users", "userDeletedDescription", language, { name: deleteDialog.userName }),
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, userId: "", userName: "" })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("users", "teamManagement", language)}</h2>
            <p className="text-muted-foreground">{t("users", "teamManagementDescription", language)}</p>
          </div>
          <Button
            className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
            asChild
          >
            <Link href="/users/add">
              <Plus className="mr-2 h-4 w-4" />
              {t("users", "inviteMember", language)}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("users", "searchUser", language)}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t("users", "teamMembers", language)}</CardTitle>
            <CardDescription>{t("users", "totalUsers", language, { count: sortedData.length })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="fullName"
                      label={t("users", "name", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader
                      column="email"
                      label={t("users", "email", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                    />
                    <SortableHeader
                      column="role"
                      label={t("users", "role", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
                    />
                    <SortableHeader
                      column="lastLogin"
                      label={t("users", "lastLogin", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <SortableHeader
                      column="status"
                      label={t("users", "status", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
                    />
                    <TableHead className="text-right">{t("users", "actions", language)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((user) => (
                    <TableRow key={user.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-center">{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString("fr-FR") : "-"}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-amber-600 hover:bg-amber-100"
                                  asChild
                                >
                                  <Link href={`/users/edit/${user.id}`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">{t("users", "edit", language)}</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("users", "edit", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:bg-red-100"
                                  onClick={() => handleDeleteClick(user.id, user.fullName)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t("users", "delete", language)}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("users", "delete", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t("users", "deleteUser", language)}
        description={t("users", "deleteConfirmation", language)}
        itemName={deleteDialog.userName}
      />
    </PageAnimation>
  )
}

"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { clients as initialClients } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSort } from "@/hooks/use-sort"
import { SortableHeader } from "@/components/sortable-header"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function ClientsPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState(initialClients)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; clientId: string; clientName: string }>({
    isOpen: false,
    clientId: "",
    clientName: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredClients, { column: "name", direction: "asc" })

  const handleDeleteClick = (clientId: string, clientName: string) => {
    setDeleteDialog({
      isOpen: true,
      clientId,
      clientName,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the client from the state
    setClients((prevClients) => prevClients.filter((client) => client.id !== deleteDialog.clientId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, clientId: "", clientName: "" })

    // Show success toast
    toast({
      title: t("clients", "clientDeleted", language),
      description: t("clients", "clientDeletedSuccess", language, { name: deleteDialog.clientName }),
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, clientId: "", clientName: "" })
  }

  const exportToExcel = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add headers
    csvContent += `${t("clients", "name", language)},${t("clients", "email", language)},${t("clients", "phone", language)},${t("clients", "totalSpent", language)},${t("clients", "invoices", language)},${t("clients", "lastPurchase", language)}\n`

    // Add data rows
    clients.forEach((client) => {
      const row = [
        client.name,
        client.email,
        client.phone,
        client.totalSpent,
        client.invoiceCount,
        formatDate(client.lastPurchase),
      ].join(",")
      csvContent += row + "\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `clients_export_${formatDate(new Date().toISOString())}.csv`)
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)

    // Show success toast
    toast({
      title: t("clients", "exportSuccess", language),
      description: t("clients", "exportSuccessMessage", language, { count: clients.length }),
    })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("clients", "clientsManagement", language)}</h2>
            <p className="text-muted-foreground">{t("clients", "clientsDescription", language)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white"
              onClick={exportToExcel}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("clients", "exportAll", language)}
            </Button>
            <Link href="/clients/add">
              <Button className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white">
                <Plus className="mr-2 h-4 w-4" />
                {t("clients", "addClient", language)}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("clients", "searchClient", language)}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="p-3">
            <CardTitle className="text-base">{t("clients", "clientsList", language)}</CardTitle>
            <CardDescription className="text-xs">
              {t("clients", "totalClients", language, { count: sortedData.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full [&_th]:py-2 [&_td]:py-2 [&_th]:px-2 [&_td]:px-2 [&_th]:text-xs [&_td]:text-sm">
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow className="hover:bg-transparent">
                    <SortableHeader
                      column="name"
                      label={t("clients", "name", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader
                      column="email"
                      label={t("clients", "email", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                    />
                    <SortableHeader
                      column="phone"
                      label={t("clients", "phone", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <SortableHeader
                      column="totalSpent"
                      label={t("clients", "totalSpent", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="invoiceCount"
                      label={t("clients", "invoices", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="lastPurchase"
                      label={t("clients", "lastPurchase", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <TableHead className="text-right">{t("clients", "actions", language)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((client) => (
                    <TableRow key={client.id} className="h-10 hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{client.name}</TableCell>
                      <TableCell className="text-xs">{client.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{client.phone}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(client.totalSpent)}</TableCell>
                      <TableCell className="text-right text-xs">{client.invoiceCount}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{formatDate(client.lastPurchase)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-blue-600 hover:bg-blue-100"
                                  onClick={() => router.push(`/clients/view/${client.id}`)}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="sr-only">{t("common", "view", language)}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common", "view", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/clients/edit/${client.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-amber-600 hover:bg-amber-100"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    <span className="sr-only">{t("common", "edit", language)}</span>
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common", "edit", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:bg-red-100"
                                  onClick={() => handleDeleteClick(client.id, client.name)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only">{t("common", "delete", language)}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common", "delete", language)}</p>
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
        title={t("clients", "deleteConfirmation", language)}
        description={t("clients", "deleteConfirmationMessage", language)}
        itemName={deleteDialog.clientName}
      />
    </PageAnimation>
  )
}

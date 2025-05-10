"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, FileText, Edit, Trash2, CheckCircle, AlertCircle, Clock, Download } from "lucide-react"

import { invoices as initialInvoices } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
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

export default function InvoicesPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [invoices, setInvoices] = useState(initialInvoices)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; invoiceId: string; invoiceNumber: string }>({
    isOpen: false,
    invoiceId: "",
    invoiceNumber: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredInvoices, { column: "date", direction: "desc" })

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t("invoices", "status_draft", language)}
          </Badge>
        )
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <FileText className="mr-1 h-3 w-3" />
            {t("invoices", "status_sent", language)}
          </Badge>
        )
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("invoices", "status_paid", language)}
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t("invoices", "status_partial", language)}
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            <AlertCircle className="mr-1 h-3 w-3" />
            {t("invoices", "status_overdue", language)}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDeleteClick = (invoiceId: string, invoiceNumber: string) => {
    setDeleteDialog({
      isOpen: true,
      invoiceId,
      invoiceNumber,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the invoice from the state
    setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== deleteDialog.invoiceId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, invoiceId: "", invoiceNumber: "" })

    // Show success toast
    toast({
      title: t("invoices", "invoice_deleted", language),
      description: t("invoices", "invoice_deleted_desc", language, { number: deleteDialog.invoiceNumber }),
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, invoiceId: "", invoiceNumber: "" })
  }

  // Add a function to handle exporting all invoices
  const handleExportAll = () => {
    // Create CSV content
    const headers = [
      t("invoices", "number", language),
      t("invoices", "date", language),
      t("invoices", "client", language),
      t("invoices", "amount_ht", language),
      t("invoices", "amount_ttc", language),
      t("invoices", "paid", language),
      t("invoices", "status", language),
    ]
    const csvContent = [
      headers.join(","),
      ...filteredInvoices.map((invoice) =>
        [
          invoice.number,
          formatDate(invoice.date),
          invoice.clientName,
          invoice.totalHT,
          invoice.totalTTC,
          invoice.paidAmount,
          invoice.status,
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `factures_export_${new Date().toISOString().split("T")[0]}.csv`

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(url)

    toast({
      title: t("invoices", "export_success", language),
      description: t("invoices", "export_success_desc", language, { count: filteredInvoices.length }),
      duration: 3000,
    })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("invoices", "manage_invoices", language)}</h2>
            <p className="text-muted-foreground">{t("invoices", "create_manage_invoices", language)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white"
              onClick={handleExportAll}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("invoices", "export_all", language)}
            </Button>
            <Button
              className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
              onClick={() => router.push("/invoices/add")}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("invoices", "add_invoice", language)}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("invoices", "search_invoice", language)}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t("invoices", "invoice_list", language)}</CardTitle>
            <CardDescription>{t("invoices", "total_count", language, { count: sortedData.length })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="number"
                      label={t("invoices", "number", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader
                      column="date"
                      label={t("invoices", "date", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                    />
                    <SortableHeader
                      column="clientName"
                      label={t("invoices", "client", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                    />
                    <SortableHeader
                      column="totalTTC"
                      label={t("invoices", "amount_ttc", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="paidAmount"
                      label={t("invoices", "paid", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="status"
                      label={t("invoices", "status", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
                    />
                    <TableHead className="text-right">{t("invoices", "actions", language)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{invoice.number}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.totalTTC)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:bg-blue-100"
                                  onClick={() => router.push(`/invoices/view/${invoice.id}`)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">{t("invoices", "view", language)}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("invoices", "view", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-amber-600 hover:bg-amber-100"
                                  onClick={() => router.push(`/invoices/edit/${invoice.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">{t("invoices", "edit", language)}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("invoices", "edit", language)}</p>
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
                                  onClick={() => handleDeleteClick(invoice.id, invoice.number)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t("invoices", "delete", language)}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("invoices", "delete", language)}</p>
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
        title={t("invoices", "delete_invoice", language)}
        description={t("invoices", "delete_confirmation", language)}
        itemName={deleteDialog.invoiceNumber}
      />
    </PageAnimation>
  )
}

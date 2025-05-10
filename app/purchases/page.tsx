"use client"

import { useState } from "react"
import { Plus, Search, FileText, Edit, Trash2, CheckCircle, Send, Clock } from "lucide-react"
import Link from "next/link"

import { purchaseOrders as initialPurchaseOrders } from "@/lib/mock-data"
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

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { purchasesTranslations } from "@/lib/translations"

// Update the component to use translations
export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; orderId: string; orderNumber: string }>({
    isOpen: false,
    orderId: "",
    orderNumber: "",
  })
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (key: keyof typeof purchasesTranslations[typeof language], params?: Record<string, string | number>) => {
      const translation = purchasesTranslations[language][key]
      if (!params) return translation
      return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }

  // Filter purchase orders based on search term
  const filteredPurchaseOrders = purchaseOrders.filter(
    (order) =>
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredPurchaseOrders, { column: "date", direction: "desc" })

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t("draft")}
          </Badge>
        )
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <Send className="mr-1 h-3 w-3" />
            {t("sent")}
          </Badge>
        )
      case "received":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("received")}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            <Trash2 className="mr-1 h-3 w-3" />
            {t("cancelled")}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDeleteClick = (orderId: string, orderNumber: string) => {
    setDeleteDialog({
      isOpen: true,
      orderId,
      orderNumber,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the purchase order from the state
    setPurchaseOrders((prevOrders) => prevOrders.filter((order) => order.id !== deleteDialog.orderId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, orderId: "", orderNumber: "" })

    // Show success toast
    toast({
      title: t("purchaseOrderDeleted"),
      description: t("purchaseOrderDeletedDescription", { number: deleteDialog.orderNumber }),
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, orderId: "", orderNumber: "" })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("purchaseManagement")}</h2>
            <p className="text-muted-foreground">{t("purchaseManagementDescription")}</p>
          </div>
          <Button
            className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
            asChild
          >
            <Link href="/purchases/add">
              <Plus className="mr-2 h-4 w-4" />
              {t("createPurchaseOrder")}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchPurchaseOrder")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t("purchaseOrdersList")}</CardTitle>
            <CardDescription>{t("totalPurchaseOrders", { count: sortedData.length })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="number"
                      label={t("number")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader column="date" label={t("date")} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader column="supplierName" label={t("supplier")} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader
                      column="totalAmount"
                      label={t("amount")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="status"
                      label={t("status")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
                    />
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((order) => (
                    <TableRow key={order.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{order.number}</TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{order.supplierName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100" asChild>
                                  <Link href={`/purchases/view/${order.id}`}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">{t("view")}</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("view")}</p>
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
                                  asChild
                                >
                                  <Link href={`/purchases/edit/${order.id}`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">{t("edit")}</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("edit")}</p>
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
                                  onClick={() => handleDeleteClick(order.id, order.number)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t("delete")}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("delete")}</p>
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
        title={t("deletePurchaseOrder")}
        description={t("deleteConfirmation")}
        itemName={deleteDialog.orderNumber}
      />
    </PageAnimation>
  )
}

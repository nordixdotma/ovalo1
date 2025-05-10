"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  BanknoteIcon,
  CreditCard,
  CheckSquare,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { expenses as initialExpenses } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { expensesTranslations } from "@/lib/translations"

// Update the component to use translations
export default function DepensesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expenses, setExpenses] = useState(initialExpenses)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; expenseId: string; expenseNumber: string }>({
    isOpen: false,
    expenseId: "",
    expenseNumber: "",
  })
  const { toast } = useToast()
  const router = useRouter()
  const { language } = useLanguage()
  type TranslationKeys = keyof typeof expensesTranslations["en"]; // Replace "en" with a default language key
  const t = (key: TranslationKeys, params?: Record<string, string | number>) => {
      const translation = expensesTranslations[language][key];
      if (!params) return translation;
      return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation);
  }

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.supplier && expense.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.reference && expense.reference.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredExpenses, { column: "date", direction: "desc" })

  // Helper function to get payment method badge
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <BanknoteIcon className="mr-1 h-3 w-3" />
            {t("cash")}
          </Badge>
        )
      case "bank":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <CreditCard className="mr-1 h-3 w-3" />
            {t("bank")}
          </Badge>
        )
      case "check":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            <CheckSquare className="mr-1 h-3 w-3" />
            {t("check")}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            {t("other")}
          </Badge>
        )
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("paid")}
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            <AlertCircle className="mr-1 h-3 w-3" />
            {t("pending")}
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

  const handleDeleteClick = (expenseId: string, expenseNumber: string) => {
    setDeleteDialog({
      isOpen: true,
      expenseId,
      expenseNumber,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the expense from the state
    setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== deleteDialog.expenseId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, expenseId: "", expenseNumber: "" })

    // Show success toast
    toast({
      title: t("expenseDeleted"),
      description: t("expenseDeletedDescription", { number: deleteDialog.expenseNumber }),
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, expenseId: "", expenseNumber: "" })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("expenseManagement")}</h2>
            <p className="text-muted-foreground">{t("expenseManagementDescription")}</p>
          </div>
          <Button
            className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
            onClick={() => router.push("/depenses/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("addExpense")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchExpense")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t("expensesList")}</CardTitle>
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
                    <SortableHeader column="category" label={t("category")} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader
                      column="supplier"
                      label={t("supplier")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <SortableHeader
                      column="totalAmount"
                      label={t("totalAmount")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="paymentMethod"
                      label={t("payment")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
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
                  {sortedData.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{expense.number}</TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{expense.supplier || "-"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.totalAmount)}</TableCell>
                      <TableCell className="text-center">{getMethodBadge(expense.paymentMethod)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(expense.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:bg-blue-100"
                                  onClick={() => router.push(`/depenses/view/${expense.id}`)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">{t("view")}</span>
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
                                  onClick={() => router.push(`/depenses/edit/${expense.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">{t("edit")}</span>
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
                                  onClick={() => handleDeleteClick(expense.id, expense.number)}
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
        title={t("deleteExpense")}
        description={t("deleteConfirmation")}
        itemName={deleteDialog.expenseNumber}
      />
    </PageAnimation>
  )
}

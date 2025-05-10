"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  BanknoteIcon,
  CreditCard,
  CheckSquare,
  FileText,
  Calendar,
  User,
  CreditCardIcon as PaymentIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { Loader } from "@/components/loader"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { expenses } from "@/lib/mock-data"
import { useLanguage } from "@/lib/contexts/language-context"
import { expensesTranslations } from "@/lib/translations"

export default function ViewExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [expense, setExpense] = useState<any>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; expenseId: string; expenseNumber: string }>({
    isOpen: false,
    expenseId: "",
    expenseNumber: "",
  })

  // Add the translation function in the component
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = expensesTranslations[language][key]
    if (!params) return translation
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }

  useEffect(() => {
    // Simulate API call to fetch expense data
    const fetchExpense = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const foundExpense = expenses.find((e) => e.id === params.id)

      if (foundExpense) {
        setExpense(foundExpense)
      }

      setIsLoading(false)
    }

    fetchExpense()
  }, [params.id])

  const handleDeleteClick = () => {
    if (!expense) return

    setDeleteDialog({
      isOpen: true,
      expenseId: expense.id,
      expenseNumber: expense.number,
    })
  }

  const handleDeleteConfirm = () => {
    // Simulate API call
    toast({
      title: "Dépense supprimée",
      description: `La dépense "${deleteDialog.expenseNumber}" a été supprimée avec succès.`,
      duration: 5000,
    })

    // Close the dialog and redirect
    setDeleteDialog({ isOpen: false, expenseId: "", expenseNumber: "" })
    router.push("/depenses")
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, expenseId: "", expenseNumber: "" })
  }

  // Helper function to get payment method badge
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <BanknoteIcon className="mr-1 h-3 w-3" />
            Espèces
          </Badge>
        )
      case "bank":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <CreditCard className="mr-1 h-3 w-3" />
            Virement
          </Badge>
        )
      case "check":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            <CheckSquare className="mr-1 h-3 w-3" />
            Chèque
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            Autre
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
            Payée
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            En attente
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            Annulée
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return <Loader />
  }

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("expenseNotFound")}</h2>
        <p className="text-muted-foreground mb-4">{t("expenseNotFoundDescription")}</p>
        <Button onClick={() => router.push("/depenses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToList")}
        </Button>
      </div>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/depenses")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t("expenseDetails")}</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/depenses/edit/${expense.id}`)}
              className="gap-1 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
            >
              <Edit className="h-4 w-4" />
              {t("edit")}
            </Button>
            <Button
              variant="outline"
              className="gap-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              {t("delete")}
            </Button>
          </div>
        </div>

        {/* Redesigned Information and Amounts Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-4 bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <CardTitle className="text-[#9c2d40] text-lg font-medium my-0">{t("expenseInformation")}</CardTitle>
            {getStatusBadge(expense.status)}
          </CardHeader>
          <CardContent className="pt-2 space-y-6">
            {/* Supplier Information */}
            {expense.supplier && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{expense.supplier}</h3>
                  <p className="text-sm text-gray-500">{t("supplier")}</p>
                </div>
              </div>
            )}

            {/* Expense Details - 4 items in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Expense Number */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("number")}</p>
                  <p className="text-lg font-semibold text-[#9c2d40]">{expense.number}</p>
                  {expense.reference && <p className="text-xs text-gray-500">Réf: {expense.reference}</p>}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("date")}</p>
                  <p className="text-lg font-semibold">{formatDate(expense.date)}</p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("category")}</p>
                  <p className="text-lg font-semibold">{expense.category}</p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9c2d40]/10 flex items-center justify-center">
                  <PaymentIcon className="h-5 w-5 text-[#9c2d40]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("totalAmountTTC")}</p>
                  <p className="text-lg font-semibold text-[#9c2d40]">{formatCurrency(expense.totalAmount)}</p>
                  <p className="text-xs text-gray-500">Paiement: {getMethodBadge(expense.paymentMethod)}</p>
                </div>
              </div>
            </div>

            {/* Description if available */}
            {expense.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{t("description")}</h4>
                <p className="text-sm text-gray-600">{expense.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center pb-4 pt-4 bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <PaymentIcon className="h-5 w-5 text-[#9c2d40] mr-2" />
            <CardTitle className="text-[#9c2d40] text-lg font-medium my-0">{t("financialDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                <TableRow>
                  <TableHead className="text-[#9c2d40] font-medium">{t("description")}</TableHead>
                  <TableHead className="text-right">{t("amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t("amountDetails")}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("vatAmount", { rate: expense.taxRate })}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.taxAmount)}</TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-bold">{t("totalAmountTTC")}</TableCell>
                  <TableCell className="text-right font-bold text-[#9c2d40]">
                    {formatCurrency(expense.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
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

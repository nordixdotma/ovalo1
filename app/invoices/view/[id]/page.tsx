"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Pencil, Download, Calendar, Clock, CreditCard, User, ShoppingCart } from "lucide-react"
import { invoices } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/loader"
import { Progress } from "@/components/ui/progress"
// Add the import for the PDF utility
import { generateInvoicePDF } from "@/lib/pdf-utils"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function InvoiceView() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  // Add the toast hook in the component
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call
    const fetchInvoice = () => {
      setTimeout(() => {
        const foundInvoice = invoices.find((i) => i.id === params.id)
        if (foundInvoice) {
          setInvoice(foundInvoice)
        }
        setLoading(false)
      }, 1000)
    }

    fetchInvoice()
  }, [params.id])

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">{t("invoices", "status_draft", language)}</Badge>
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            {t("invoices", "status_sent", language)}
          </Badge>
        )
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            {t("invoices", "status_paid", language)}
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            {t("invoices", "status_partial", language)}
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            {t("invoices", "status_overdue", language)}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return <Loader />
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("invoices", "invoice_not_found", language)}</h2>
        <p className="text-muted-foreground mb-4">{t("invoices", "invoice_not_found_desc", language)}</p>
        <Button onClick={() => router.push("/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("invoices", "back_to_invoices", language)}
        </Button>
      </div>
    )
  }

  // Calculate payment progress
  const paymentProgress = (invoice.paidAmount / invoice.totalTTC) * 100

  // Add a function to handle exporting to PDF
  const handleExportPDF = () => {
    const success = generateInvoicePDF(invoice)
    if (success) {
      toast({
        title: t("invoices", "pdf_generated", language),
        description: t("invoices", "pdf_generated_desc", language, { number: invoice.number }),
        duration: 3000,
      })
    }
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/invoices")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t("invoices", "invoice_details", language)}</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/invoices/edit/${invoice.id}`)}
              className="gap-1 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
            >
              <Pencil className="h-4 w-4" />
              {t("invoices", "edit", language)}
            </Button>
            <Button
              className="gap-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4" />
              {t("invoices", "export_pdf", language)}
            </Button>
          </div>
        </div>

        {/* Redesigned Information and Amounts Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-4 bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <CardTitle className="text-[#9c2d40] text-lg font-medium my-0">
              {t("invoices", "invoice_info", language)}
            </CardTitle>
            {getStatusBadge(invoice.status)}
          </CardHeader>
          <CardContent className="pt-2 space-y-6">
            {/* Client Information */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{invoice.clientName}</h3>
                <p className="text-sm text-gray-500">
                  {t("invoices", "client_rc", language, {
                    rc: invoice.clientRC || t("invoices", "not_specified", language),
                  })}
                </p>
              </div>
            </div>

            {/* Invoice Details - 4 items in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Invoice Number */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("invoices", "number", language)}</p>
                  <p className="text-lg font-semibold text-[#9c2d40]">{invoice.number}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("invoices", "date", language)}</p>
                  <p className="text-lg font-semibold">{formatDate(invoice.date)}</p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("invoices", "due_date", language)}</p>
                  <p className="text-lg font-semibold">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : t("invoices", "not_specified", language)}
                  </p>
                </div>
              </div>

              {/* Total TTC */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9c2d40]/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[#9c2d40]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("invoices", "total_ttc", language)}</p>
                  <p className="text-lg font-semibold text-[#9c2d40]">{formatCurrency(invoice.totalTTC)}</p>
                </div>
              </div>
            </div>

            {/* Payment Progress */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("invoices", "paid", language)}</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(invoice.paidAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">{t("invoices", "remaining", language)}</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(invoice.totalTTC - invoice.paidAmount)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("invoices", "payment_progress", language)}</span>
                  <span className="font-medium">{Math.round(paymentProgress)}%</span>
                </div>
                <Progress value={paymentProgress} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center pb-4 pt-4 bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <ShoppingCart className="h-5 w-5 text-[#9c2d40] mr-2" />
            <CardTitle className="text-[#9c2d40] text-lg font-medium my-0">
              {t("invoices", "items", language)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                <TableRow>
                  <TableHead className="text-[#9c2d40] font-medium w-[40%]">
                    {t("invoices", "product_service", language)}
                  </TableHead>
                  <TableHead className="text-right">{t("invoices", "unit_price", language)}</TableHead>
                  <TableHead className="text-right">{t("invoices", "quantity", language)}</TableHead>
                  <TableHead className="text-right">{t("invoices", "total_ht", language)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalHT)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={3} className="text-right font-semibold">
                    {t("invoices", "total_ht", language)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(invoice.totalHT)}</TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={3} className="text-right font-semibold">
                    {t("invoices", "vat", language)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(invoice.totalTTC - invoice.totalHT)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={3} className="text-right font-bold">
                    {t("invoices", "total_ttc", language)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#9c2d40]">
                    {formatCurrency(invoice.totalTTC)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageAnimation>
  )
}

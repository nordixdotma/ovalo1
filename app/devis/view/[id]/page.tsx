"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Download,
  FileText,
  Calendar,
  Clock,
  CreditCard,
  User,
  ShoppingCart,
  FileCheck,
} from "lucide-react"
import { devis } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/loader"
import { useToast } from "@/components/ui/use-toast"
// Add the import for the PDF utility
import { generateDevisPDF } from "@/lib/pdf-utils"
// Add Dialog imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/contexts/language-context"
import { devisTranslations } from "@/lib/translations/devis"

export default function DevisView() {
  const { language } = useLanguage()
  const t = devisTranslations[language]

  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [devisItem, setDevisItem] = useState<any>(null)
  // Add state for the conversion dialog
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [invoiceStatus, setInvoiceStatus] = useState("draft")

  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call
    const fetchDevis = () => {
      setTimeout(() => {
        const foundDevis = devis.find((d) => d.id === params.id)
        if (foundDevis) {
          // Add TVA to items if not present
          const itemsWithTVA = foundDevis.items.map((item) => ({
            ...item,
            tva: item.tva || 20, // Default to 20% if not specified
          }))

          setDevisItem({
            ...foundDevis,
            items: itemsWithTVA,
            reference: foundDevis.reference || "",
            paymentTerms: foundDevis.paymentTerms || "30",
            validityPeriod: foundDevis.validityPeriod || "30",
            notes: foundDevis.notes || "",
          })
        }
        setLoading(false)
      }, 1000)
    }

    fetchDevis()
  }, [params.id])

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">{t.status.draft}</Badge>
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            {t.status.sent}
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            {t.status.accepted}
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            {t.status.rejected}
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            {t.status.expired}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Helper function to format payment terms
  const formatPaymentTerms = (terms: string) => {
    if (terms === "immediate") return t.paymentTermsOptions.immediate
    if (terms === "custom") return t.paymentTermsOptions.custom
    if (terms === "15") return t.paymentTermsOptions.days15
    if (terms === "30") return t.paymentTermsOptions.days30
    if (terms === "60") return t.paymentTermsOptions.days60
    if (terms === "90") return t.paymentTermsOptions.days90
    return `${terms} ${language === "ar" ? "يوم" : "jours"}`
  }

  // Update the convert function to open the dialog
  const handleOpenConvertDialog = () => {
    setShowConvertDialog(true)
  }

  const handleConvertToInvoice = () => {
    // Simulate API call
    setTimeout(() => {
      toast({
        title: t.convertedToInvoice,
        description: t.convertedToInvoiceSuccess.replace("{number}", devisItem.number),
        duration: 5000,
      })
      // Close the dialog
      setShowConvertDialog(false)
      // Generate a random invoice ID
      const invoiceId = `inv-${Math.random().toString(36).substring(2, 10)}`
      // Redirect to the invoice view page
      router.push(`/invoices/view/${invoiceId}`)
    }, 1000)
  }

  // Add a function to handle exporting to PDF
  const handleExportPDF = () => {
    const success = generateDevisPDF(devisItem)
    if (success) {
      toast({
        title: t.pdfGenerated,
        description: t.pdfGeneratedSuccess.replace("{number}", devisItem.number),
        duration: 3000,
      })
    }
  }

  // Calculate totals with potentially different TVA rates
  const calculateTotals = () => {
    if (!devisItem) return { totalHT: 0, totalTVA: 0, totalTTC: 0 }

    let totalHT = 0
    let totalTVA = 0

    devisItem.items.forEach((item: any) => {
      totalHT += item.totalHT
      totalTVA += item.totalHT * (item.tva / 100)
    })

    const totalTTC = totalHT + totalTVA
    return { totalHT, totalTVA, totalTTC }
  }

  const totals = calculateTotals()

  if (loading) {
    return <Loader />
  }

  if (!devisItem) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t.quoteNotFound}</h2>
        <p className="text-muted-foreground mb-4">{t.quoteNotFoundExplanation}</p>
        <Button onClick={() => router.push("/devis")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToList}
        </Button>
      </div>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/devis")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t.details}</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/devis/edit/${devisItem.id}`)}
              className="gap-1 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
            >
              <Pencil className="h-4 w-4" />
              {t.modify}
            </Button>
            <Button
              className="gap-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4" />
              {t.exportPDF}
            </Button>
            <Button
              className="gap-1 bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
              onClick={handleOpenConvertDialog}
            >
              <RefreshCw className="h-4 w-4" />
              {t.convertToInvoice}
            </Button>
          </div>
        </div>

        {/* Redesigned Information and Amounts Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-4 bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <CardTitle className="text-[#9c2d40] text-lg font-medium my-0">{t.quoteInfo}</CardTitle>
            {getStatusBadge(devisItem.status)}
          </CardHeader>
          <CardContent className="pt-2 space-y-6">
            {/* Client Information */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{devisItem.clientName}</h3>
                <p className="text-sm text-gray-500">RC: {devisItem.clientRC || "Non spécifié"}</p>
              </div>
            </div>

            {/* Devis Details - 4 items in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Devis Number */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t.number}</p>
                  <p className="text-lg font-semibold text-[#9c2d40]">{devisItem.number}</p>
                  {devisItem.reference && <p className="text-xs text-gray-500">Réf: {devisItem.reference}</p>}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t.date}</p>
                  <p className="text-lg font-semibold">{formatDate(devisItem.date)}</p>
                </div>
              </div>

              {/* Expiration Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t.expirationDateLabel}</p>
                  <p className="text-lg font-semibold">
                    {devisItem.dueDate ? formatDate(devisItem.dueDate) : "Non spécifiée"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {devisItem.validityPeriod
                      ? `${devisItem.validityPeriod} ${language === "ar" ? "يوم" : "jours"}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Total TTC */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9c2d40]/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[#9c2d40]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t.totalTTC}</p>
                  <p className="text-lg font-semibold text-[#9c2d40]">{formatCurrency(totals.totalTTC)}</p>
                  <p className="text-xs text-gray-500">{formatPaymentTerms(devisItem.paymentTerms)}</p>
                </div>
              </div>
            </div>

            {/* Notes section if available */}
            {devisItem.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  {t.notesAndConditions}
                </h4>
                <p className="text-sm text-gray-600">{devisItem.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center pb-4 pt-4 bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <ShoppingCart className="h-5 w-5 text-[#9c2d40] mr-2" />
            <CardTitle className="text-[#9c2d40] text-lg font-medium my-0">{t.items}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                <TableRow>
                  <TableHead className="text-[#9c2d40] font-medium w-[40%]">{t.productService}</TableHead>
                  <TableHead className="text-right">{t.unitPrice}</TableHead>
                  <TableHead className="text-right">{t.quantity}</TableHead>
                  <TableHead className="text-right">{t.tva}</TableHead>
                  <TableHead className="text-right">{t.totalHT}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devisItem.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.tva}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalHT)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="text-right font-semibold">
                    {t.totalHT}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(totals.totalHT)}</TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="text-right font-semibold">
                    {t.tva}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(totals.totalTVA)}</TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="text-right font-bold">
                    {t.totalTTC}
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#9c2d40]">
                    {formatCurrency(totals.totalTTC)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add the conversion dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#9c2d40]">{t.convertToInvoiceTitle}</DialogTitle>
            <DialogDescription>{t.convertToInvoiceDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t.number}</Label>
                <p className="font-semibold text-[#9c2d40]">{devisItem.number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t.client}</Label>
                <p className="font-semibold">{devisItem.clientName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                {t.invoiceStatus}
              </Label>
              <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t.status.draft}</SelectItem>
                  <SelectItem value="sent">{t.status.sent}</SelectItem>
                  <SelectItem value="paid">Payée</SelectItem>
                  <SelectItem value="partial">Partiellement payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> {t.conversionNote}
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
              {t.cancel}
            </Button>
            <Button
              className="bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
              onClick={handleConvertToInvoice}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t.convert}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageAnimation>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, ExternalLink, Download } from "lucide-react"
import { creditNotes, invoices } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { Loader } from "@/components/loader"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function AvoirView() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [creditNote, setCreditNote] = useState<any>(null)
  const [relatedInvoice, setRelatedInvoice] = useState<any>(null)
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations.avoirs[language][key] || key
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value))
      })
    }
    return text
  }

  useEffect(() => {
    // Simulate API call
    const fetchData = () => {
      setTimeout(() => {
        const foundCreditNote = creditNotes.find((cn) => cn.id === params.id)
        if (foundCreditNote) {
          setCreditNote(foundCreditNote)

          // Find related invoice
          const foundInvoice = invoices.find((inv) => inv.id === foundCreditNote.invoiceId)
          if (foundInvoice) {
            setRelatedInvoice(foundInvoice)
          }
        }
        setLoading(false)
      }, 1000)
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return <Loader />
  }

  if (!creditNote) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("creditNoteNotFound")}</h2>
        <p className="text-muted-foreground mb-4">{t("creditNoteNotFoundDesc")}</p>
        <Button onClick={() => router.push("/avoirs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToCreditNotes")}
        </Button>
      </div>
    )
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    alert("PDF export functionality not implemented yet.")
  }

  const avoir = creditNote

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/avoirs")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t("detailsTitle")}</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              className="gap-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4" />
              {t("exportPDF")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("creditNoteInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("creditNoteNumber")}</p>
                  <p className="text-lg font-semibold text-[#9c2d40]">{avoir.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("date")}</p>
                  <p className="text-lg font-semibold">{formatDate(creditNote.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("client")}</p>
                  <p className="text-lg font-semibold">{creditNote.clientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("amount")}</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(creditNote.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("associatedInvoiceTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("invoiceNumber")}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-blue-600">{creditNote.invoiceNumber}</p>
                    {relatedInvoice && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => router.push(`/invoices/view/${relatedInvoice.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {relatedInvoice && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("invoiceDate")}</p>
                    <p className="text-lg font-semibold">{formatDate(relatedInvoice.date)}</p>
                  </div>
                )}
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground">{t("creditNoteReasonTitle")}</p>
                <p className="text-base mt-1 p-3 bg-gray-50 rounded-md border">{creditNote.reason}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("financialDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">{t("amountExclTax")}</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(creditNote.amount / 1.2)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">{t("vat")}</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(creditNote.amount - creditNote.amount / 1.2)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="text-sm font-medium text-muted-foreground">{t("amountInclTax")}</p>
                <p className="text-xl font-bold mt-1 text-green-600">{formatCurrency(creditNote.amount)}</p>
              </div>
            </div>
            <p className="p-3 text-sm bg-gray-50 border rounded-md">
              {t("creditNoteIssuedInfo", {
                date: formatDate(creditNote.date),
                invoiceNumber: creditNote.invoiceNumber,
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageAnimation>
  )
}

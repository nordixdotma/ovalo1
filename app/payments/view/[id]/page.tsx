"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, ExternalLink } from "lucide-react"
import { payments, invoices } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/loader"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function PaymentView() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations.payments[language]

  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState<any>(null)
  const [relatedInvoice, setRelatedInvoice] = useState<any>(null)

  useEffect(() => {
    // Simulate API call
    const fetchData = () => {
      setTimeout(() => {
        const foundPayment = payments.find((p) => p.id === params.id)
        if (foundPayment) {
          setPayment(foundPayment)

          // Find related invoice
          const foundInvoice = invoices.find((inv) => inv.id === foundPayment.invoiceId)
          if (foundInvoice) {
            setRelatedInvoice(foundInvoice)
          }
        }
        setLoading(false)
      }, 1000)
    }

    fetchData()
  }, [params.id])

  // Helper function to get payment method badge
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            {t.cash}
          </Badge>
        )
      case "bank":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            {t.bank}
          </Badge>
        )
      case "check":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            {t.check}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            {t.other}
          </Badge>
        )
    }
  }

  if (loading) {
    return <Loader />
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t.paymentNotFound}</h2>
        <p className="text-muted-foreground mb-4">{t.paymentNotFoundDesc}</p>
        <Button onClick={() => router.push("/payments")}>
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
            <Button variant="outline" size="icon" onClick={() => router.push("/payments")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t.paymentDetails}</h2>
          </div>
          <div className="flex space-x-2">{/* Action buttons removed */}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t.paymentInfo}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.date}</p>
                <p className="text-lg font-semibold">{formatDate(payment.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.amount}</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.method}</p>
                <div className="text-lg font-semibold">{getMethodBadge(payment.method)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.reference}</p>
                <p className="text-lg font-semibold">{payment.reference || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.client}</p>
                <p className="text-lg font-semibold">{payment.clientName}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t.associatedInvoice}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t.invoiceNumber}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-blue-600">{payment.invoiceNumber}</p>
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
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.invoiceDate}</p>
                      <p className="text-lg font-semibold">{formatDate(relatedInvoice.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.totalAmount}</p>
                      <p className="text-lg font-semibold">{formatCurrency(relatedInvoice.totalTTC)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.remainingToPay}</p>
                      <p className="text-lg font-semibold text-amber-600">
                        {formatCurrency(relatedInvoice.totalTTC - relatedInvoice.paidAmount)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t.additionalDetails}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">{t.registrationDate}</p>
                <p className="text-xl font-bold mt-1">{formatDate(payment.date)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">{t.paymentMethod}</p>
                <p className="text-xl font-bold mt-1">{getMethodBadge(payment.method)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="text-sm font-medium text-muted-foreground">{t.amount}</p>
                <p className="text-xl font-bold mt-1 text-green-600">{formatCurrency(payment.amount)}</p>
              </div>
            </div>
            <p className="p-3 text-sm bg-gray-50 border rounded-md">
              {t.paymentRegisteredText
                .replace("{date}", formatDate(payment.date))
                .replace("{invoice}", payment.invoiceNumber)}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageAnimation>
  )
}

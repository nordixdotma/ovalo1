"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { invoices } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function AddPaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = translations.payments[language]

  const [selectedInvoice, setSelectedInvoice] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [reference, setReference] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter invoices that have remaining balance
  const unpaidInvoices = invoices.filter((invoice) => invoice.paidAmount < invoice.totalTTC)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: t.paymentRecorded,
        description: t.paymentRecordedDesc,
      })
      setIsSubmitting(false)
      router.push("/payments")
    }, 1500)
  }

  const getInvoiceDetails = (id: string) => {
    const invoice = invoices.find((inv) => inv.id === id)
    if (!invoice) return null

    const remainingAmount = invoice.totalTTC - invoice.paidAmount
    return {
      number: invoice.number,
      client: invoice.clientName,
      date: formatDate(invoice.date),
      total: formatCurrency(invoice.totalTTC),
      paid: formatCurrency(invoice.paidAmount),
      remaining: formatCurrency(remainingAmount),
      remainingRaw: remainingAmount,
    }
  }

  const selectedInvoiceDetails = selectedInvoice ? getInvoiceDetails(selectedInvoice) : null

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/payments")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t.recordPayment}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t.invoiceSelection}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice" className="font-medium">
                    {t.invoice}
                  </Label>
                  <Select
                    value={selectedInvoice}
                    onValueChange={(value) => {
                      setSelectedInvoice(value)
                      const details = getInvoiceDetails(value)
                      if (details) {
                        setAmount(details.remainingRaw.toString())
                      }
                    }}
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue placeholder={t.selectInvoice} />
                    </SelectTrigger>
                    <SelectContent>
                      {unpaidInvoices.length > 0 ? (
                        unpaidInvoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.number} - {invoice.clientName} (
                            {formatCurrency(invoice.totalTTC - invoice.paidAmount)})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          {t.noUnpaidInvoices}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoiceDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.client}</p>
                      <p className="font-semibold">{selectedInvoiceDetails.client}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.invoiceDate}</p>
                      <p className="font-semibold">{selectedInvoiceDetails.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.totalAmount}</p>
                      <p className="font-semibold">{selectedInvoiceDetails.total}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.alreadyPaid}</p>
                      <p className="font-semibold">{selectedInvoiceDetails.paid}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.remainingToPay}</p>
                      <p className="font-semibold text-amber-600">{selectedInvoiceDetails.remaining}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.paymentDetails}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t.amount}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0.01"
                    max={selectedInvoiceDetails?.remainingRaw.toString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">{t.paymentMethod}</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectInvoice} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t.cash}</SelectItem>
                      <SelectItem value="bank">{t.bank}</SelectItem>
                      <SelectItem value="check">{t.check}</SelectItem>
                      <SelectItem value="card">{t.card}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">{t.optionalReference}</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder={t.referencePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t.paymentDate}</Label>
                  <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/payments")} disabled={isSubmitting}>
              {t.cancel}
            </Button>
            <Button
              type="submit"
              className="bg-[#9c2d40] hover:bg-[#8a2838]"
              disabled={isSubmitting || !selectedInvoice || !paymentMethod || !amount}
            >
              {isSubmitting ? (
                <>{t.saving}</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t.save}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageAnimation>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { invoices } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function AddAvoirPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.avoirs[typeof language]) => translations.avoirs[language][key] || key

  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    reason: "",
  })

  // Filter only paid invoices
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.invoiceId || !formData.amount || !formData.reason) {
      toast({
        title: t("validationError"),
        description: t("fillRequiredFields"),
        variant: "destructive",
      })
      return
    }

    // Simulate saving
    toast({
      title: t("creditNoteCreated"),
      description: t("creditNoteSuccess"),
    })

    // Redirect to avoirs list
    router.push("/avoirs")
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/avoirs")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t("createTitle")}</h2>
          </div>
          <Button className="bg-[#9c2d40] hover:bg-[#8a2838] gap-1" onClick={handleSubmit}>
            <Save className="h-4 w-4" />
            {t("save")}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("creditNoteInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceId" className="font-medium">
                    {t("associatedInvoice")} *
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange("invoiceId", value)} value={formData.invoiceId}>
                    <SelectTrigger className="border-gray-300 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue placeholder={t("selectInvoice")} />
                    </SelectTrigger>
                    <SelectContent>
                      {paidInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.number} - {invoice.clientName} ({formatCurrency(invoice.totalHT)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("creditNoteAmount")} *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">{t("creditNoteReason")} *</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder={t("reasonPlaceholder")}
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageAnimation>
  )
}

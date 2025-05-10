"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/contexts/language-context"
import { suppliersTranslations } from "@/lib/translations/suppliers"

export default function AddSupplierPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (key: keyof typeof suppliersTranslations.en) => suppliersTranslations[language][key]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    notes: "",
    taxId: "",
    website: "",
    paymentTerms: "",
    category: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: t("supplierAdded"),
        description: t("supplierAddedDescription").replace("{name}", formData.name),
      })
      router.push("/suppliers")
    }, 1000)
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("addSupplierTitle")}</h2>
            <p className="text-muted-foreground text-sm">{t("addSupplierDescription")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("supplierInfo")}</CardTitle>
              <CardDescription>{t("supplierInfoDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">
                    {t("supplierName")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("supplierName")}
                    required
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("email")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("email")}
                    required
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("phone")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">{t("contactPerson")}</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder={t("contactPerson")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t("taxId")}</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder={t("taxId")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t("website")}</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder={t("websitePlaceholder")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">{t("paymentTerms")}</Label>
                  <Input
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    placeholder={t("paymentTermsPlaceholder")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t("category")}</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder={t("categoryPlaceholder")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t("address")}
                  rows={3}
                  className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t("notesPlaceholder")}
                  rows={3}
                  className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-between py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-200 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40] gap-1"
              >
                <X className="h-4 w-4" />
                {t("cancel")}
              </Button>
              <Button type="submit" className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 gap-1" disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageAnimation>
  )
}

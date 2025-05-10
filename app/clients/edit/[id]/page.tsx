"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { clients } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "@/components/loader"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function EditClientPage({ params }: { params: { id: string } }) {
  const { language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    contactPerson: "",
    notes: "",
    taxId: "",
    rc: "",
    website: "",
  })

  useEffect(() => {
    // Simulate API call to fetch client data
    setTimeout(() => {
      const client = clients.find((c) => c.id === params.id)
      if (client) {
        setFormData({
          name: client.name,
          email: client.email,
          phone: client.phone || "",
          address: client.address || "",
          city: client.city || "",
          postalCode: client.postalCode || "",
          country: client.country || "Maroc",
          contactPerson: client.contactPerson || "",
          notes: client.notes || "",
          taxId: client.taxId || "",
          rc: client.rc || "",
          website: client.website || "",
        })
        setIsLoading(false)
      } else {
        toast({
          title: t("common", "error", language),
          description: t("clients", "clientNotFound", language),
          variant: "destructive",
        })
        router.push("/clients")
      }
    }, 1000)
  }, [params.id, router, toast, language])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.name || !formData.email) {
      toast({
        title: t("clients", "validationError", language),
        description: t("clients", "fillRequiredFields", language),
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would update the data in your backend here
      toast({
        title: t("clients", "clientModified", language),
        description: t("clients", "clientModifiedSuccess", language, { name: formData.name }),
      })
      setIsSubmitting(false)
      router.push("/clients")
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{t("clients", "editClient", language)}</h2>
            <p className="text-muted-foreground text-sm">{t("clients", "clientsDescription", language)}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="gap-1 h-9">
            <ArrowLeft className="h-4 w-4" />
            {t("common", "back", language)}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
                <CardTitle className="text-[#9c2d40] text-lg font-medium">
                  {t("clients", "mainInformation", language)}
                </CardTitle>
                <CardDescription>{t("clients", "requiredFields", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">
                    {t("clients", "clientName", language)} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("clients", "companyName", language)}
                    required
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    {t("clients", "email", language)} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("clients", "emailPlaceholder", language)}
                    required
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium">
                    {t("clients", "phone", language)}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("clients", "phonePlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="font-medium">
                    {t("clients", "contactPerson", language)}
                  </Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder={t("clients", "contactPersonPlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="font-medium">
                    {t("clients", "taxId", language)}
                  </Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder={t("clients", "taxIdPlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rc" className="font-medium">
                    {t("clients", "rc", language)}
                  </Label>
                  <Input
                    id="rc"
                    name="rc"
                    value={formData.rc}
                    onChange={handleChange}
                    placeholder={t("clients", "rcPlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="font-medium">
                    {t("clients", "website", language)}
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder={t("clients", "websitePlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
                <CardTitle className="text-[#9c2d40] text-lg font-medium">
                  {t("clients", "addressAndNotes", language)}
                </CardTitle>
                <CardDescription>{t("clients", "additionalInformation", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-medium">
                    {t("clients", "address", language)}
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t("clients", "addressPlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-medium">
                    {t("clients", "city", language)}
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={t("clients", "cityPlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="font-medium">
                    {t("clients", "postalCode", language)}
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder={t("clients", "postalCodePlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="font-medium">
                    {t("clients", "country", language)}
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder={t("clients", "countryPlaceholder", language)}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-medium">
                    {t("clients", "notes", language)}
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t("clients", "notesPlaceholder", language)}
                    rows={4}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" type="button" onClick={() => router.back()} className="gap-1">
              {t("common", "cancel", language)}
            </Button>
            <Button type="submit" className="bg-[#9c2d40] hover:bg-[#8a2838] gap-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t("clients", "saving", language)}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("common", "save", language)}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageAnimation>
  )
}

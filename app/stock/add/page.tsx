"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { products } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function AddStockMovementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { language } = useLanguage()
  const t = (key: string) => translations.stock[language][key] || key

  const [formData, setFormData] = useState({
    productId: "",
    type: "in",
    quantity: "",
    reason: "",
    reference: "",
    notes: "",
    performedBy: "",
    locationFrom: "",
    locationTo: "",
    unitCost: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.productId || !formData.quantity || !formData.reason) {
      toast({
        title: t("validationError"),
        description: t("fillRequiredFields"),
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would save the data to your backend here
      toast({
        title: t("stockMovementAdded"),
        description: t("stockMovementSuccess"),
      })
      setIsSubmitting(false)
      router.push("/stock")
    }, 1000)
  }

  // Get selected product details
  const selectedProduct = products.find((p) => p.id === formData.productId)

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{t("addTitle")}</h2>
            <p className="text-muted-foreground">{t("addDescription")}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-[#9c2d40]/10 shadow-sm">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <CardTitle className="text-[#9c2d40]">{t("movementDetails")}</CardTitle>
              <CardDescription>{t("requiredFields")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="space-y-2">
                <Label htmlFor="type">
                  {t("movementType")} <span className="text-red-500">*</span>
                </Label>
                <RadioGroup value={formData.type} onValueChange={handleRadioChange} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in" id="in" />
                    <Label htmlFor="in" className="font-normal cursor-pointer">
                      {t("entry")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="out" id="out" />
                    <Label htmlFor="out" className="font-normal cursor-pointer">
                      {t("exit")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId">
                  {t("product")} <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.productId} onValueChange={(value) => handleSelectChange("productId", value)}>
                  <SelectTrigger id="productId">
                    <SelectValue placeholder={t("selectProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.currentStock} en stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                  <p>
                    <strong>{t("selectedProduct")}</strong> {selectedProduct.name}
                  </p>
                  <p>
                    <strong>{t("currentStockLabel")}</strong> {selectedProduct.currentStock} {selectedProduct.unit}(s)
                  </p>
                  <p>
                    <strong>{t("purchasePrice")}</strong> {selectedProduct.costPrice || t("notDefined")}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    {t("quantity")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder={t("quantity")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">{t("unitCost")}</Label>
                  <Input
                    id="unitCost"
                    name="unitCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  {t("reason")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Ex: Achat, Vente, Retour, Ajustement..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">{t("reference")}</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder={t("referencePlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationFrom">{t("originLocation")}</Label>
                  <Input
                    id="locationFrom"
                    name="locationFrom"
                    value={formData.locationFrom}
                    onChange={handleChange}
                    placeholder={formData.type === "in" ? t("originPlaceholder") : t("warehousePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationTo">{t("destinationLocation")}</Label>
                  <Input
                    id="locationTo"
                    name="locationTo"
                    value={formData.locationTo}
                    onChange={handleChange}
                    placeholder={formData.type === "in" ? t("warehousePlaceholder") : t("destinationPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="performedBy">{t("performedBy")}</Label>
                <Input
                  id="performedBy"
                  name="performedBy"
                  value={formData.performedBy}
                  onChange={handleChange}
                  placeholder={t("performedByPlaceholder")}
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
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-end py-4">
              <div className="flex gap-3">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  {t("cancel")}
                </Button>
                <Button type="submit" className="bg-[#9c2d40] hover:bg-[#8a2838]" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("save")}
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageAnimation>
  )
}

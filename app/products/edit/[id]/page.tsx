"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload, X } from "lucide-react"

import { products, taxes } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader } from "@/components/loader"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [productImage, setProductImage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    unit: "",
    category: "",
    sku: "",
    barcode: "",
    initialStock: "",
    minStockLevel: "",
    maxStockLevel: "",
    taxRate: "",
    isActive: true,
  })

  useEffect(() => {
    // Simulate API call to fetch product data
    setTimeout(() => {
      const product = products.find((p) => p.id === params.id)
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          costPrice: product.costPrice?.toString() || "",
          unit: product.unit,
          category: product.category,
          sku: product.sku || "",
          barcode: product.barcode || "",
          initialStock: product.initialStock.toString(),
          minStockLevel: product.minStockLevel?.toString() || "0",
          maxStockLevel: product.maxStockLevel?.toString() || "0",
          taxRate: product.taxRate?.toString() || "20",
          isActive: product.isActive,
        })

        // Set product image if available
        if (product.images && product.images.length > 0) {
          setProductImage(product.images[0])
        }

        setIsLoading(false)
      } else {
        toast({
          title: t("common", "error", language),
          description: t("products", "productNotFound", language),
          variant: "destructive",
        })
        router.push("/products")
      }
    }, 1000)
  }, [params.id, router, toast, language])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProductImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.name || !formData.price || !formData.unit || !formData.category) {
      toast({
        title: t("products", "validationError", language),
        description: t("products", "fillRequiredFields", language),
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would update the data in your backend here
      toast({
        title: t("products", "productModified", language),
        description: t("products", "productModifiedSuccess", language, { name: formData.name }),
      })
      setIsSubmitting(false)
      router.push("/products")
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
            <h2 className="text-2xl font-bold tracking-tight">{t("products", "editProduct", language)}</h2>
            <p className="text-muted-foreground text-sm">{t("products", "productCatalogDescription", language)}</p>
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
                  {t("products", "mainInformation", language)}
                </CardTitle>
                <CardDescription>{t("products", "requiredFields", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">
                    {t("products", "productName", language)} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("products", "productNamePlaceholder", language)}
                    required
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("products", "description", language)}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t("products", "descriptionPlaceholder", language)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      {t("products", "sellingPrice", language)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">{t("products", "costPrice", language)}</Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">
                      {t("products", "unit", language)} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                      <SelectTrigger id="unit">
                        <SelectValue placeholder={t("products", "unit", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pièce">{t("products", "piece", language)}</SelectItem>
                        <SelectItem value="kg">{t("products", "kilogram", language)}</SelectItem>
                        <SelectItem value="litre">{t("products", "liter", language)}</SelectItem>
                        <SelectItem value="mètre">{t("products", "meter", language)}</SelectItem>
                        <SelectItem value="heure">{t("products", "hour", language)}</SelectItem>
                        <SelectItem value="jour">{t("products", "day", language)}</SelectItem>
                        <SelectItem value="lot">{t("products", "lot", language)}</SelectItem>
                        <SelectItem value="service">{t("products", "service", language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      {t("products", "category", language)} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder={t("products", "category", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Informatique">{t("products", "computers", language)}</SelectItem>
                        <SelectItem value="Mobilier">{t("products", "furniture", language)}</SelectItem>
                        <SelectItem value="Fournitures">{t("products", "supplies", language)}</SelectItem>
                        <SelectItem value="Logiciels">{t("products", "software", language)}</SelectItem>
                        <SelectItem value="Services">{t("products", "services", language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">{t("products", "taxRate", language)}</Label>
                  <Select value={formData.taxRate} onValueChange={(value) => handleSelectChange("taxRate", value)}>
                    <SelectTrigger id="taxRate">
                      <SelectValue placeholder={t("products", "taxRate", language)} />
                    </SelectTrigger>
                    <SelectContent>
                      {taxes.map((tax) => (
                        <SelectItem key={tax.id} value={tax.rate.toString()}>
                          {tax.name} ({tax.rate}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isActive">{t("products", "isActive", language)}</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
                <CardTitle className="text-[#9c2d40] text-lg font-medium">
                  {t("products", "stockAndIdentification", language)}
                </CardTitle>
                <CardDescription>{t("products", "stockInfo", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">{t("products", "sku", language)}</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder={t("products", "skuPlaceholder", language)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">{t("products", "barcode", language)}</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder={t("products", "barcodePlaceholder", language)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialStock">{t("products", "initialStock", language)}</Label>
                    <Input
                      id="initialStock"
                      name="initialStock"
                      type="number"
                      min="0"
                      value={formData.initialStock}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel">{t("products", "minStockLevel", language)}</Label>
                    <Input
                      id="minStockLevel"
                      name="minStockLevel"
                      type="number"
                      min="0"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStockLevel">{t("products", "maxStockLevel", language)}</Label>
                    <Input
                      id="maxStockLevel"
                      name="maxStockLevel"
                      type="number"
                      min="0"
                      value={formData.maxStockLevel}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="productImage" className="font-medium">
                    {t("products", "productImage", language)}
                  </Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-32 w-32 rounded-md border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                      {productImage ? (
                        <img
                          src={productImage || "/placeholder.svg"}
                          alt={t("products", "preview", language)}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">{t("products", "preview", language)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <input
                        type="file"
                        id="image-upload"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-200 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40] gap-1"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        {t("products", "uploadImage", language)}
                      </Button>
                      {productImage && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-200 hover:bg-red-50 hover:text-red-600 gap-1"
                          onClick={() => setProductImage(null)}
                        >
                          <X className="h-4 w-4" />
                          {t("products", "removeImage", language)}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              {t("common", "cancel", language)}
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
                  {t("products", "saving", language)}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
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

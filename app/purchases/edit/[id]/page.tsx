"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, X, Plus, Trash2 } from "lucide-react"

import { purchaseOrders, suppliers, products } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { purchasesTranslations } from "@/lib/translations/purchases"

export default function EditPurchaseOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    number: "",
    date: "",
    supplierId: "",
    status: "",
    items: [] as {
      id: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }[],
  })

  // Add language context
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = purchasesTranslations[language][key as keyof typeof purchasesTranslations[typeof language]]
    if (!params) return translation
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }

  useEffect(() => {
    // Simulate API call to fetch purchase order data
    setTimeout(() => {
      const order = purchaseOrders.find((o) => o.id === params.id)
      if (order) {
        setFormData({
          number: order.number,
          date: order.date,
          supplierId: order.supplierId,
          status: order.status,
          items: [...order.items],
        })
      }
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...formData.items]

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value as string,
          productName: product.name,
          unitPrice: product.price,
          totalPrice: product.price * updatedItems[index].quantity,
        }
      }
    } else if (field === "quantity") {
      const quantity = Number(value)
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        totalPrice: updatedItems[index].unitPrice * quantity,
      }
    } else if (field === "unitPrice") {
      const unitPrice = Number(value)
      updatedItems[index] = {
        ...updatedItems[index],
        unitPrice,
        totalPrice: unitPrice * updatedItems[index].quantity,
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      }
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }))
  }

  const addItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    }
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const removeItem = (index: number) => {
    const updatedItems = [...formData.items]
    updatedItems.splice(index, 1)
    setFormData((prev) => ({ ...prev, items: updatedItems }))
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: t("purchaseOrderUpdated"),
        description: t("purchaseOrderUpdatedDescription", { number: formData.number }),
      })
      router.push("/purchases")
    }, 1000)
  }

  if (isLoading) {
    return (
      <PageAnimation>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          <Card className="border-[#9c2d40]/10 shadow-md">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </PageAnimation>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("editPurchaseOrder")}</h2>
            <p className="text-muted-foreground text-sm">{t("editPurchaseOrderDescription")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("purchaseOrderInfo")}</CardTitle>
              <CardDescription>{t("purchaseOrderInfoDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="number" className="font-medium">
                    {t("number")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder={t("purchaseOrderNumber")}
                    required
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    {t("date")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierId">
                    {t("supplier")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => handleSelectChange("supplierId", value)}
                  >
                    <SelectTrigger className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue placeholder={t("selectProduct")} />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {t("status")} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue placeholder={t("selectProduct")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("draft")}</SelectItem>
                      <SelectItem value="sent">{t("sent")}</SelectItem>
                      <SelectItem value="received">{t("received")}</SelectItem>
                      <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{t("items")}</h3>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    className="border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addItemButton")}
                  </Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                      <TableRow>
                        <TableHead className="text-[#9c2d40] font-medium">{t("product")}</TableHead>
                        <TableHead className="text-right">{t("quantity")}</TableHead>
                        <TableHead className="text-right">{t("unitPrice")}</TableHead>
                        <TableHead className="text-right">{t("total")}</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => handleItemChange(index, "productId", value)}
                            >
                              <SelectTrigger className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                                <SelectValue placeholder={t("selectProduct")} />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="w-20 text-right border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                              className="w-24 text-right border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t("delete")}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {formData.items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            {t("noItems")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between font-medium">
                      <span>{t("total")}:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
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
              <Button
                type="submit"
                className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 gap-1"
                disabled={isSubmitting || formData.items.length === 0}
              >
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

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, X, Plus, Trash2 } from "lucide-react"

import { suppliers, products } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { purchasesTranslations } from "@/lib/translations/purchases"

interface PurchaseItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function AddPurchasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    number: `BC${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    date: new Date().toISOString().split("T")[0],
    supplierId: "",
    notes: "",
    expectedDeliveryDate: "",
    paymentTerms: "",
    shippingMethod: "",
    shippingCost: "",
  })
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: 1,
    unitPrice: 0,
  })

  // Add language context
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = purchasesTranslations[language][key]
    if (!params) return translation
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplierId)
  const selectedProduct = products.find((p) => p.id === newItem.productId)

  useEffect(() => {
    if (selectedProduct) {
      setNewItem((prev) => ({
        ...prev,
        unitPrice: selectedProduct.costPrice || selectedProduct.price * 0.8, // Default to 80% of selling price if no cost price
      }))
    }
  }, [newItem.productId, selectedProduct])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "productId" ? value : Number.parseFloat(value) || 0,
    }))
  }

  const handleNewItemSelectChange = (name: string, value: string) => {
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "productId" ? value : Number.parseFloat(value) || 0,
    }))
  }

  const addItem = () => {
    if (!newItem.productId || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast({
        title: t("error"),
        description: t("invalidProductError"),
        variant: "destructive",
      })
      return
    }

    const product = products.find((p) => p.id === newItem.productId)
    if (!product) return

    const newItemWithDetails: PurchaseItem = {
      id: `item-${Date.now()}`,
      productId: newItem.productId,
      productName: product.name,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice: newItem.quantity * newItem.unitPrice,
    }

    setItems((prev) => [...prev, newItemWithDetails])
    setNewItem({
      productId: "",
      quantity: 1,
      unitPrice: 0,
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.supplierId) {
      toast({
        title: t("error"),
        description: t("selectSupplierError"),
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: t("error"),
        description: t("noItemsError"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: t("purchaseOrderCreated"),
        description: t("purchaseOrderCreatedDescription", { number: formData.number }),
      })
      router.push("/purchases")
    }, 1000)
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("createPurchaseOrderTitle")}</h2>
            <p className="text-muted-foreground text-sm">{t("createPurchaseOrderDescription")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
                  <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("generalInfo")}</CardTitle>
                  <CardDescription>{t("generalInfoDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="number" className="font-medium">
                        {t("purchaseOrderNumber")}
                      </Label>
                      <Input
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">{t("date")}</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
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
                      <Label htmlFor="expectedDeliveryDate">{t("expectedDeliveryDate")}</Label>
                      <Input
                        id="expectedDeliveryDate"
                        name="expectedDeliveryDate"
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={handleChange}
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
                      <Label htmlFor="shippingMethod">{t("shippingMethod")}</Label>
                      <Input
                        id="shippingMethod"
                        name="shippingMethod"
                        value={formData.shippingMethod}
                        onChange={handleChange}
                        placeholder={t("shippingMethodPlaceholder")}
                        className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                      />
                    </div>
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
              </Card>

              <Card className="border-[#9c2d40]/10 shadow-md">
                <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                  <CardTitle className="text-[#9c2d40]">{t("items")}</CardTitle>
                  <CardDescription>{t("itemsDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="productId">{t("product")}</Label>
                      <Select
                        value={newItem.productId}
                        onValueChange={(value) => handleNewItemSelectChange("productId", value)}
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">{t("quantity")}</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={handleNewItemChange}
                        className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">{t("unitPrice")}</Label>
                      <Input
                        id="unitPrice"
                        name="unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.unitPrice}
                        onChange={handleNewItemChange}
                        className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={addItem} className="bg-[#9c2d40] hover:bg-[#9c2d40]/90">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("addItem")}
                    </Button>
                  </div>

                  {items.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                          <TableRow>
                            <TableHead className="text-[#9c2d40] font-medium">{t("product")}</TableHead>
                            <TableHead className="text-right">{t("quantity")}</TableHead>
                            <TableHead className="text-right">{t("unitPrice")}</TableHead>
                            <TableHead className="text-right">{t("total")}</TableHead>
                            <TableHead className="text-right">{t("actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id} className="hover:bg-[#9c2d40]/5">
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:bg-red-100"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t("delete")}</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200 h-fit sticky top-6">
                <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
                  <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("summary")}</CardTitle>
                  <CardDescription>{t("summaryDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("orderNumber")}</span>
                      <span className="font-medium">{formData.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("orderDate")}</span>
                      <span className="font-medium">{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("orderSupplier")}</span>
                      <span className="font-medium">{selectedSupplier?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("itemCount")}</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("totalQuantity")}</span>
                      <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between">
                      <span className="font-semibold">{t("totalAmount")}</span>
                      <span className="font-bold text-[#9c2d40]">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex flex-col gap-4 py-4">
                  <Button type="submit" className="w-full bg-[#9c2d40] hover:bg-[#9c2d40]/90" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? t("saving") : t("save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40]"
                    onClick={() => router.back()}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t("cancel")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PageAnimation>
  )
}

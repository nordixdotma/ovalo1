"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { devis as allDevis, products, taxes } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageAnimation } from "@/components/page-animation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader } from "@/components/loader"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/lib/contexts/language-context"
import { devisTranslations } from "@/lib/translations/devis"

export default function DevisEdit() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = devisTranslations[language]

  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>({
    number: "",
    date: "",
    dueDate: "",
    clientId: "",
    clientName: "",
    reference: "",
    paymentTerms: "30",
    validityPeriod: "30",
    notes: "",
    items: [],
    status: "draft",
    totalHT: 0,
    totalTTC: 0,
  })

  const [newItem, setNewItem] = useState({
    productId: "",
    productName: "",
    description: "",
    unitPrice: 0,
    quantity: 1,
    tva: 20,
  })

  useEffect(() => {
    // Simulate API call
    const fetchDevis = () => {
      setTimeout(() => {
        const foundDevis = allDevis.find((d) => d.id === params.id)
        if (foundDevis) {
          // Format date for HTML input
          const dateObj = new Date(foundDevis.date)
          const formattedDate = dateObj.toISOString().split("T")[0]

          // Add TVA to items if not present
          const itemsWithTVA = foundDevis.items.map((item) => ({
            ...item,
            tva: item.tva || 20, // Default to 20% if not specified
          }))

          setFormData({
            ...foundDevis,
            date: formattedDate,
            dueDate: foundDevis.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            reference: foundDevis.reference || "",
            paymentTerms: foundDevis.paymentTerms || "30",
            validityPeriod: foundDevis.validityPeriod || "30",
            notes: foundDevis.notes || "",
            items: itemsWithTVA,
          })
        }
        setLoading(false)
      }, 1000)
    }

    fetchDevis()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleAddItem = () => {
    if (!newItem.productId) {
      toast({
        title: t.error,
        description: t.selectProductError,
        variant: "destructive",
      })
      return
    }

    const product = products.find((p) => p.id === newItem.productId)
    if (!product) return

    const item = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      description: product.description,
      unitPrice: product.price,
      quantity: newItem.quantity,
      tva: newItem.tva,
      totalHT: product.price * newItem.quantity,
    }

    const updatedItems = [...formData.items, item]
    updateTotals(updatedItems)

    setNewItem({
      productId: "",
      productName: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
      tva: 20,
    })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]

    if (field === "productId" && value) {
      // Find the selected product
      const selectedProduct = products.find((p) => p.id === value)
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.price,
          totalHT: selectedProduct.price * updatedItems[index].quantity,
        }
      }
    } else if (field === "quantity") {
      const qty = Number.parseFloat(value) || 0
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: qty,
        totalHT: qty * updatedItems[index].unitPrice,
      }
    } else if (field === "unitPrice") {
      const price = Number.parseFloat(value) || 0
      updatedItems[index] = {
        ...updatedItems[index],
        unitPrice: price,
        totalHT: price * updatedItems[index].quantity,
      }
    } else if (field === "tva") {
      updatedItems[index] = {
        ...updatedItems[index],
        tva: Number(value),
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      }
    }

    updateTotals(updatedItems)
  }

  const updateTotals = (items: any[]) => {
    // Calculate totals with potentially different TVA rates per item
    let totalHT = 0
    let totalTVA = 0

    items.forEach((item) => {
      totalHT += item.totalHT
      totalTVA += item.totalHT * (item.tva / 100)
    })

    const totalTTC = totalHT + totalTVA

    setFormData((prev: any) => ({
      ...prev,
      items,
      totalHT,
      totalTTC,
    }))
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_: any, i: number) => i !== index)
    updateTotals(updatedItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate saving the data
    setTimeout(() => {
      toast({
        title: t.quoteModified,
        description: t.quoteModifiedSuccess.replace("{number}", formData.number),
        duration: 5000,
      })
      router.push(`/devis/view/${params.id}`)
    }, 1000)
  }

  if (loading) {
    return <Loader />
  }

  if (!formData.id) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-2">{t.quoteNotFound}</h2>
        <p className="text-muted-foreground mb-4">{t.quoteNotFoundDesc}</p>
        <Button onClick={() => router.push("/devis")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToQuotes}
        </Button>
      </div>
    )
  }

  return (
    <PageAnimation>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/devis/view/${params.id}`)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t.editQuote}</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/devis/view/${params.id}`)}
              className="gap-1"
            >
              {t.cancel}
            </Button>
            <Button type="submit" className="bg-[#9c2d40] hover:bg-[#8a2838] gap-1">
              <Save className="h-4 w-4" />
              {t.save}
            </Button>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <CardTitle className="text-[#9c2d40] text-lg font-medium">{t.quoteInformation}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number" className="font-medium">
                  {t.quoteNumber} *
                </Label>
                <Input
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference" className="font-medium">
                  {t.reference}
                </Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="font-medium">
                  {t.statusLabel}
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t.selectStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t.status.draft}</SelectItem>
                    <SelectItem value="sent">{t.status.sent}</SelectItem>
                    <SelectItem value="accepted">{t.status.accepted}</SelectItem>
                    <SelectItem value="rejected">{t.status.rejected}</SelectItem>
                    <SelectItem value="expired">{t.status.expired}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="font-medium">
                  {t.client} *
                </Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="font-medium">
                  {t.date} *
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="font-medium">
                  {t.expiryDate} *
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validityPeriod" className="font-medium">
                  {t.validityPeriod}
                </Label>
                <Select
                  value={formData.validityPeriod}
                  onValueChange={(value) => handleSelectChange("validityPeriod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectPeriod} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">{t.days.replace("{days}", "15")}</SelectItem>
                    <SelectItem value="30">{t.days.replace("{days}", "30")}</SelectItem>
                    <SelectItem value="60">{t.days.replace("{days}", "60")}</SelectItem>
                    <SelectItem value="90">{t.days.replace("{days}", "90")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="font-medium">
                  {t.paymentTerms}
                </Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(value) => handleSelectChange("paymentTerms", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectTerms} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">{t.immediatePayment}</SelectItem>
                    <SelectItem value="15">{t.days.replace("{days}", "15")}</SelectItem>
                    <SelectItem value="30">{t.days.replace("{days}", "30")}</SelectItem>
                    <SelectItem value="60">{t.days.replace("{days}", "60")}</SelectItem>
                    <SelectItem value="custom">{t.custom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-medium">
                {t.notesAndConditions}
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder={t.enterNotesPlaceholder}
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">{t.items}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    value={newItem.productId}
                    onValueChange={(value) => setNewItem({ ...newItem, productId: value })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t.selectProduct} />
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
                <Input
                  type="number"
                  min="1"
                  placeholder={t.quantity}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 1 })}
                  className="w-[100px]"
                />
              </div>
              <Button type="button" onClick={handleAddItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                {t.add}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                <TableRow>
                  <TableHead className="text-[#9c2d40] font-medium w-[30%]">{t.productService}</TableHead>
                  <TableHead>{t.quantity}</TableHead>
                  <TableHead>{t.unitPrice}</TableHead>
                  <TableHead>{t.vat}</TableHead>
                  <TableHead>{t.totalHT}</TableHead>
                  <TableHead className="text-right w-[80px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      {t.noItemsAdded}
                    </TableCell>
                  </TableRow>
                ) : (
                  formData.items.map((item: any, index: number) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleItemChange(index, "productId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectProduct} />
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
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={String(item.tva)}
                          onValueChange={(value) => handleItemChange(index, "tva", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.vat} />
                          </SelectTrigger>
                          <SelectContent>
                            {taxes.map((tax) => (
                              <SelectItem key={tax.id} value={tax.rate.toString()}>
                                {tax.name} ({tax.rate}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatCurrency(item.totalHT)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t.delete}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="text-right font-semibold">
                    {t.totalHT}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(formData.totalHT)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="text-right font-semibold">
                    {t.vat}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(formData.totalTTC - formData.totalHT)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="text-right font-bold">
                    {t.totalTTC}
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#9c2d40]">
                    {formatCurrency(formData.totalTTC)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </form>
    </PageAnimation>
  )
}

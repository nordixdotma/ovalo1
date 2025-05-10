"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { invoices as allInvoices, products } from "@/lib/mock-data"
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
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function InvoiceEdit() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>({
    number: "",
    date: "",
    dueDate: "",
    clientId: "",
    clientName: "",
    items: [],
    status: "draft",
    totalHT: 0,
    totalTTC: 0,
    paidAmount: 0,
  })

  useEffect(() => {
    // Simulate API call
    const fetchInvoice = () => {
      setTimeout(() => {
        const foundInvoice = allInvoices.find((i) => i.id === params.id)
        if (foundInvoice) {
          // Format date for HTML input
          const dateObj = new Date(foundInvoice.date)
          const formattedDate = dateObj.toISOString().split("T")[0]

          // Format due date if it exists
          let formattedDueDate = ""
          if (foundInvoice.dueDate) {
            const dueDateObj = new Date(foundInvoice.dueDate)
            formattedDueDate = dueDateObj.toISOString().split("T")[0]
          }

          setFormData({
            ...foundInvoice,
            date: formattedDate,
            dueDate: formattedDueDate,
          })
        }
        setLoading(false)
      }, 1000)
    }

    fetchInvoice()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, status: value }))
  }

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalHT: 0,
    }

    setFormData((prev: any) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
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
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      }
    }

    // Calculate totals
    const totalHT = updatedItems.reduce((sum, item) => sum + item.totalHT, 0)
    const totalTTC = totalHT * 1.2 // 20% VAT

    setFormData((prev: any) => ({
      ...prev,
      items: updatedItems,
      totalHT,
      totalTTC,
    }))
  }

  const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const paidAmount = Number.parseFloat(e.target.value) || 0

    // Update status based on paid amount
    let newStatus = formData.status
    if (paidAmount <= 0) {
      newStatus = "sent"
    } else if (paidAmount >= formData.totalTTC) {
      newStatus = "paid"
    } else if (paidAmount > 0 && paidAmount < formData.totalTTC) {
      newStatus = "partial"
    }

    setFormData((prev: any) => ({
      ...prev,
      paidAmount,
      status: newStatus,
    }))
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_: any, i: number) => i !== index)

    // Calculate totals
    const totalHT = updatedItems.reduce((sum: number, item: any) => sum + item.totalHT, 0)
    const totalTTC = totalHT * 1.2 // 20% VAT

    setFormData((prev: any) => ({
      ...prev,
      items: updatedItems,
      totalHT,
      totalTTC,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate saving the data
    setTimeout(() => {
      toast({
        title: t("invoices", "invoice_updated", language),
        description: t("invoices", "invoice_updated_desc", language, { number: formData.number }),
        duration: 5000,
      })
      router.push(`/invoices/view/${params.id}`)
    }, 1000)
  }

  if (loading) {
    return <Loader />
  }

  if (!formData.id) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-2">{t("invoices", "invoice_not_found", language)}</h2>
        <p className="text-muted-foreground mb-4">{t("invoices", "invoice_not_found_desc", language)}</p>
        <Button onClick={() => router.push("/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("invoices", "back_to_invoices", language)}
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
              onClick={() => router.push(`/invoices/view/${params.id}`)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t("invoices", "edit_invoice", language)}</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/invoices/view/${params.id}`)}
              className="gap-1"
            >
              {t("invoices", "cancel", language)}
            </Button>
            <Button type="submit" className="bg-[#9c2d40] hover:bg-[#8a2838] gap-1">
              <Save className="h-4 w-4" />
              {t("invoices", "save", language)}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">
                {t("invoices", "invoice_info", language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="number" className="font-medium">
                    {t("invoices", "invoice_number", language)}
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
                  <Label htmlFor="date" className="font-medium">
                    {t("invoices", "date", language)}
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
                    {t("invoices", "due_date", language)}
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="font-medium">
                    {t("invoices", "client", language)}
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
                  <Label htmlFor="status" className="font-medium">
                    {t("invoices", "status", language)}
                  </Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status" className="border-gray-300 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue placeholder={t("invoices", "select_product", language)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("invoices", "status_draft", language)}</SelectItem>
                      <SelectItem value="sent">{t("invoices", "status_sent", language)}</SelectItem>
                      <SelectItem value="paid">{t("invoices", "status_paid", language)}</SelectItem>
                      <SelectItem value="partial">{t("invoices", "status_partial", language)}</SelectItem>
                      <SelectItem value="overdue">{t("invoices", "status_overdue", language)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("invoices", "payment", language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("invoices", "total_ht", language)}</Label>
                  <div className="text-2xl font-bold">{formatCurrency(formData.totalHT)}</div>
                </div>
                <div className="space-y-2">
                  <Label>{t("invoices", "total_ttc", language)}</Label>
                  <div className="text-2xl font-bold text-[#9c2d40]">{formatCurrency(formData.totalTTC)}</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidAmount">{t("invoices", "paid_amount", language)}</Label>
                  <Input
                    id="paidAmount"
                    name="paidAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={handlePaidAmountChange}
                    className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("invoices", "remaining", language)}</Label>
                <div className="text-xl font-semibold text-amber-600">
                  {formatCurrency(formData.totalTTC - formData.paidAmount)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
            <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("invoices", "items", language)}</CardTitle>
            <Button type="button" onClick={handleAddItem} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {t("invoices", "add_item", language)}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                <TableRow>
                  <TableHead className="text-[#9c2d40] font-medium w-[40%]">
                    {t("invoices", "product_service", language)}
                  </TableHead>
                  <TableHead>{t("invoices", "quantity", language)}</TableHead>
                  <TableHead>
                    {t("invoices", "unit_price", language)} ({t("invoices", "dh", language)})
                  </TableHead>
                  <TableHead>
                    {t("invoices", "total_ht", language)} ({t("invoices", "dh", language)})
                  </TableHead>
                  <TableHead className="text-right w-[80px]">{t("invoices", "actions", language)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      {t("invoices", "no_items", language)}
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
                          <SelectTrigger className="border-gray-300 focus-visible:ring-[#9c2d40]/30">
                            <SelectValue placeholder={t("invoices", "select_product", language)} />
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
                          className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="border-gray-300 focus-visible:ring-[#9c2d40]/30"
                        />
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
                          <span className="sr-only">{t("invoices", "delete", language)}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </form>
    </PageAnimation>
  )
}

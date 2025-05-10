"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save, Package, FileText, Calculator, Calendar, Clock, FileCheck } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { clients, products, taxes } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/contexts/language-context"
import { devisTranslations } from "@/lib/translations"

export default function AddDevisPage() {
  const { language } = useLanguage()
  const t = devisTranslations[language]

  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [clientsList, setClientsList] = useState<any[]>([])
  const [productsList, setProductsList] = useState<any[]>([])

  const [devis, setDevis] = useState({
    clientId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
    paymentTerms: "30",
    reference: "",
    validityPeriod: "30",
    items: [] as any[],
  })

  const [newItem, setNewItem] = useState({
    isNewProduct: false,
    productId: "",
    productName: "",
    description: "",
    unitPrice: 0,
    quantity: 1,
    tva: 20, // Default TVA rate
  })

  const [activeTab, setActiveTab] = useState("existing")

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setClientsList(clients)
      setProductsList(products)
    }, 500)
  }, [])

  useEffect(() => {
    // Update the newItem state when tab changes
    setNewItem({
      ...newItem,
      isNewProduct: activeTab === "new",
      // Reset fields when switching tabs
      productId: activeTab === "existing" ? newItem.productId : "",
      productName: activeTab === "new" ? newItem.productName : "",
      description: activeTab === "new" ? newItem.description : "",
      unitPrice: activeTab === "new" ? newItem.unitPrice : 0,
      tva: 20, // Reset to default TVA
    })
  }, [activeTab])

  const calculateTotals = () => {
    // Calculate totals with potentially different TVA rates per item
    let totalHT = 0
    let totalTVA = 0

    devis.items.forEach((item) => {
      totalHT += item.totalHT
      totalTVA += item.totalHT * (item.tva / 100)
    })

    const totalTTC = totalHT + totalTVA
    return { totalHT, totalTVA, totalTTC }
  }

  const handleAddItem = () => {
    if (activeTab === "new") {
      if (!newItem.productName || !newItem.unitPrice) {
        toast({
          title: t.incompleteInfo,
          description: t.incompleteInfo,
          variant: "destructive",
        })
        return
      }

      const item = {
        id: uuidv4(),
        productId: uuidv4(), // Generate a temporary ID for the new product
        productName: newItem.productName,
        description: newItem.description,
        unitPrice: newItem.unitPrice,
        quantity: newItem.quantity,
        tva: newItem.tva,
        totalHT: newItem.unitPrice * newItem.quantity,
        isNewProduct: true,
      }

      setDevis({
        ...devis,
        items: [...devis.items, item],
      })

      setNewItem({
        ...newItem,
        productName: "",
        description: "",
        unitPrice: 0,
        quantity: 1,
        tva: 20,
      })
    } else {
      if (!newItem.productId) {
        toast({
          title: t.incompleteInfo,
          description: t.incompleteInfo,
          variant: "destructive",
        })
        return
      }

      const product = productsList.find((p) => p.id === newItem.productId)
      if (!product) return

      const item = {
        id: uuidv4(),
        productId: product.id,
        productName: product.name,
        description: product.description,
        unitPrice: product.price,
        quantity: newItem.quantity,
        tva: product.taxRate || 20, // Use product tax rate or default to 20%
        totalHT: product.price * newItem.quantity,
        isNewProduct: false,
      }

      setDevis({
        ...devis,
        items: [...devis.items, item],
      })

      setNewItem({
        ...newItem,
        productId: "",
        quantity: 1,
      })
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setDevis({
      ...devis,
      items: devis.items.filter((item) => item.id !== itemId),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!devis.clientId) {
      toast({
        title: t.clientRequired,
        description: t.clientRequired,
        variant: "destructive",
      })
      return
    }

    if (devis.items.length === 0) {
      toast({
        title: t.itemsRequired,
        description: t.itemsRequired,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: t.quoteCreated,
        description: t.quoteCreatedSuccess,
      })
      router.push("/devis")
    }, 1000)
  }

  const totals = calculateTotals()
  const selectedClient = clientsList.find((c) => c.id === devis.clientId)

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/devis")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{t.create}</h2>
          </div>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-[#9c2d40] hover:bg-[#8a2838] gap-1">
            <Save className="h-4 w-4" />
            {isLoading ? "..." : t.createQuote}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t.quoteInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client" className="font-medium">
                    {t.clientRequired}
                  </Label>
                  <Select value={devis.clientId} onValueChange={(value) => setDevis({ ...devis, clientId: value })}>
                    <SelectTrigger id="client" className="border-gray-300 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue
                        placeholder={
                          language === "fr"
                            ? "Sélectionner un client"
                            : language === "en"
                              ? "Select a client"
                              : "اختر عميلاً"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsList.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="font-medium">
                    {t.reference}
                  </Label>
                  <Input
                    id="reference"
                    placeholder={
                      language === "fr" ? "Référence interne" : language === "en" ? "Internal reference" : "مرجع داخلي"
                    }
                    value={devis.reference}
                    onChange={(e) => setDevis({ ...devis, reference: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="font-medium">
                    {t.dateRequired}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={devis.date}
                    onChange={(e) => setDevis({ ...devis, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="font-medium">
                    {t.expirationDate}
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={devis.dueDate}
                    onChange={(e) => setDevis({ ...devis, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityPeriod" className="font-medium">
                    {t.validityPeriod}
                  </Label>
                  <Select
                    value={devis.validityPeriod}
                    onValueChange={(value) => setDevis({ ...devis, validityPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          language === "fr"
                            ? "Sélectionner une période"
                            : language === "en"
                              ? "Select a period"
                              : "اختر فترة"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">{t.paymentTermsOptions.days15}</SelectItem>
                      <SelectItem value="30">{t.paymentTermsOptions.days30}</SelectItem>
                      <SelectItem value="60">{t.paymentTermsOptions.days60}</SelectItem>
                      <SelectItem value="90">{t.paymentTermsOptions.days90}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms" className="font-medium">
                    {t.paymentTerms}
                  </Label>
                  <Select
                    value={devis.paymentTerms}
                    onValueChange={(value) => setDevis({ ...devis, paymentTerms: value })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          language === "fr"
                            ? "Sélectionner les conditions"
                            : language === "en"
                              ? "Select payment terms"
                              : "اختر شروط الدفع"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">{t.paymentTermsOptions.immediate}</SelectItem>
                      <SelectItem value="15">{t.paymentTermsOptions.days15}</SelectItem>
                      <SelectItem value="30">{t.paymentTermsOptions.days30}</SelectItem>
                      <SelectItem value="60">{t.paymentTermsOptions.days60}</SelectItem>
                      <SelectItem value="custom">{t.paymentTermsOptions.custom}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="font-medium">
                  {t.notes}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    language === "fr"
                      ? "Entrez des notes ou conditions particulières..."
                      : language === "en"
                        ? "Enter notes or special conditions..."
                        : "أدخل ملاحظات أو شروط خاصة..."
                  }
                  value={devis.notes}
                  onChange={(e) => setDevis({ ...devis, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.items}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-medium mb-4">{t.addNewItem}</h3>

                <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="existing" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t.existingProduct}
                    </TabsTrigger>
                    <TabsTrigger value="new" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t.newItem}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <Label htmlFor="product" className="mb-2 block">
                          {t.product} *
                        </Label>
                        <Select
                          value={newItem.productId}
                          onValueChange={(value) => setNewItem({ ...newItem, productId: value })}
                        >
                          <SelectTrigger id="product">
                            <SelectValue
                              placeholder={
                                language === "fr"
                                  ? "Sélectionner un produit"
                                  : language === "en"
                                    ? "Select a product"
                                    : "اختر منتجًا"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {productsList.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity" className="mb-2 block">
                          {t.quantity} *
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="new" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="productName" className="mb-2 block">
                          {t.itemName}
                        </Label>
                        <Input
                          id="productName"
                          placeholder={
                            language === "fr" ? "Nom de l'article" : language === "en" ? "Item name" : "اسم العنصر"
                          }
                          value={newItem.productName}
                          onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unitPrice" className="mb-2 block">
                          {t.unitPrice} *
                        </Label>
                        <div className="relative">
                          <Input
                            id="unitPrice"
                            type="number"
                            placeholder="0.00"
                            value={newItem.unitPrice || ""}
                            onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) || 0 })}
                            className="pl-8"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="description" className="mb-2 block">
                          {t.description}
                        </Label>
                        <Textarea
                          id="description"
                          placeholder={
                            language === "fr"
                              ? "Description de l'article"
                              : language === "en"
                                ? "Item description"
                                : "وصف العنصر"
                          }
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newQuantity" className="mb-2 block">
                            {t.quantity} *
                          </Label>
                          <Input
                            id="newQuantity"
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tva" className="mb-2 block">
                            {t.tva} *
                          </Label>
                          <Select
                            value={String(newItem.tva)}
                            onValueChange={(value) => setNewItem({ ...newItem, tva: Number(value) })}
                          >
                            <SelectTrigger id="tva">
                              <SelectValue
                                placeholder={
                                  language === "fr"
                                    ? "Sélectionner un taux de TVA"
                                    : language === "en"
                                      ? "Select VAT rate"
                                      : "اختر معدل ضريبة القيمة المضافة"
                                }
                              />
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
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-4">
                  <Button onClick={handleAddItem} className="bg-[#9c2d40] hover:bg-[#8a2838] gap-2">
                    <Plus className="h-4 w-4" />
                    {t.addItem}
                  </Button>
                </div>
              </div>

              <Table className="w-full">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="font-semibold w-[40%]">{t.product}</TableHead>
                    <TableHead className="text-right font-semibold">{t.unitPrice}</TableHead>
                    <TableHead className="text-right font-semibold">{t.quantity}</TableHead>
                    <TableHead className="text-right font-semibold">{t.tva}</TableHead>
                    <TableHead className="text-right font-semibold">{t.totalHT}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devis.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-gray-300" />
                          <p>{t.noItems}</p>
                          <p className="text-sm text-gray-500">{t.noItemsExplanation}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    devis.items.map((item, index) => (
                      <TableRow key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.tva}%</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalHT)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-100"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {devis.items.length > 0 && (
                <div className="p-4 bg-gray-50 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 font-medium">{t.totalHT}</p>
                    <p className="text-lg font-semibold">{formatCurrency(totals.totalHT)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 font-medium">{t.tva}</p>
                    <p className="font-semibold">{formatCurrency(totals.totalTVA)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-gray-800 font-bold flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      {t.totalTTC}
                    </p>
                    <p className="text-xl font-bold text-[#9c2d40]">{formatCurrency(totals.totalTTC)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
              <CardTitle className="text-[#9c2d40] text-lg font-medium flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                {t.summary}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.client}</p>
                    <p className="text-lg font-semibold">
                      {selectedClient
                        ? selectedClient.name
                        : language === "fr"
                          ? "Non sélectionné"
                          : language === "en"
                            ? "Not selected"
                            : "غير محدد"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.date}</p>
                    <p className="text-lg font-semibold">{new Date(devis.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t.expirationDateLabel}</p>
                    <p className="text-lg font-semibold">{new Date(devis.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-[#9c2d40]/5 rounded-lg border border-[#9c2d40]/10">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.quoteTotal}</p>
                  <p className="text-2xl font-bold text-[#9c2d40]">{formatCurrency(totals.totalTTC)}</p>
                </div>
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-[#9c2d40] hover:bg-[#8a2838] gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "..." : t.createQuote}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageAnimation>
  )
}

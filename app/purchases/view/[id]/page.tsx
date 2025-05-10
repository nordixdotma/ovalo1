"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Send, CheckCircle, Clock, Trash2 } from "lucide-react"
import Link from "next/link"

import { purchaseOrders, suppliers } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageAnimation } from "@/components/page-animation"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { purchasesTranslations } from "@/lib/translations/purchases"

export default function ViewPurchaseOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null)
  const [supplier, setSupplier] = useState<any>(null)

  // Add language context
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = purchasesTranslations[language][key]
    if (!params) return translation
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }

  useEffect(() => {
    // Simulate API call to fetch purchase order data
    setTimeout(() => {
      const order = purchaseOrders.find((o) => o.id === params.id)
      if (order) {
        setPurchaseOrder(order)
        const supplierData = suppliers.find((s) => s.id === order.supplierId)
        setSupplier(supplierData)
      }
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t("draft")}
          </Badge>
        )
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <Send className="mr-1 h-3 w-3" />
            {t("sent")}
          </Badge>
        )
      case "received":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("received")}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            <Trash2 className="mr-1 h-3 w-3" />
            {t("cancelled")}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = (newStatus: string) => {
    // Update the purchase order status
    setPurchaseOrder((prev: any) => ({ ...prev, status: newStatus }))

    // Show success toast
    toast({
      title: t("statusUpdated"),
      description: t("statusUpdatedDescription"),
    })
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
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-[#9c2d40]/10 shadow-md md:col-span-2">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <Skeleton className="h-6 w-48 mb-2" />
              </CardHeader>
              <CardContent className="p-0">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>

            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <Skeleton className="h-6 w-48 mb-2" />
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageAnimation>
    )
  }

  if (!purchaseOrder) {
    return (
      <PageAnimation>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="outline" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("purchaseOrderNotFound")}</h2>
              <p className="text-muted-foreground">{t("purchaseOrderNotFoundDescription")}</p>
            </div>
          </div>
        </div>
      </PageAnimation>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Button variant="outline" onClick={() => router.back()} className="mr-4 h-9 gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("purchaseOrderDetails", { number: purchaseOrder.number })}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("createdOn", { date: formatDate(purchaseOrder.date), status: getStatusBadge(purchaseOrder.status) })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:justify-start">
            <Button
              className="gap-1 bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
              asChild
            >
              <Link href={`/purchases/edit/${purchaseOrder.id}`}>
                <Edit className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200 md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("items")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                  <TableRow>
                    <TableHead className="font-medium">{t("product")}</TableHead>
                    <TableHead className="text-right">{t("quantity")}</TableHead>
                    <TableHead className="text-right">{t("unitPrice")}</TableHead>
                    <TableHead className="text-right">{t("total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrder.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end p-4 border-t">
              <div className="w-64">
                <div className="flex justify-between py-2 font-medium">
                  <span>{t("total")}:</span>
                  <span>{formatCurrency(purchaseOrder.totalAmount)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="border-[#9c2d40]/10 shadow-md">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <CardTitle className="text-[#9c2d40]">{t("information")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h3 className="font-medium mb-2">{t("supplier")}</h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{supplier?.name}</p>
                  <p>{supplier?.email}</p>
                  <p>{supplier?.phone}</p>
                  <p>{supplier?.address}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">{t("changeStatus")}</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={purchaseOrder.status === "draft" ? "default" : "outline"}
                    size="sm"
                    className={
                      purchaseOrder.status === "draft"
                        ? "bg-gray-800 hover:bg-gray-700 gap-1"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 gap-1"
                    }
                    onClick={() => handleStatusChange("draft")}
                  >
                    <Clock className="h-3 w-3" />
                    {t("draft")}
                  </Button>
                  <Button
                    variant={purchaseOrder.status === "sent" ? "default" : "outline"}
                    size="sm"
                    className={
                      purchaseOrder.status === "sent"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                    }
                    onClick={() => handleStatusChange("sent")}
                  >
                    <Send className="mr-1 h-3 w-3" />
                    {t("sent")}
                  </Button>
                  <Button
                    variant={purchaseOrder.status === "received" ? "default" : "outline"}
                    size="sm"
                    className={
                      purchaseOrder.status === "received"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                    }
                    onClick={() => handleStatusChange("received")}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {t("received")}
                  </Button>
                  <Button
                    variant={purchaseOrder.status === "cancelled" ? "default" : "outline"}
                    size="sm"
                    className={
                      purchaseOrder.status === "cancelled"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                    }
                    onClick={() => handleStatusChange("cancelled")}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    {t("cancelled")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageAnimation>
  )
}

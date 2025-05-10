"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, FileText } from "lucide-react"
import Link from "next/link"

import { suppliers, purchaseOrders } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageAnimation } from "@/components/page-animation"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/contexts/language-context"
import { suppliersTranslations } from "@/lib/translations/suppliers"

export default function ViewSupplierPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { language } = useLanguage()
  const t = (key: keyof typeof suppliersTranslations.en) => suppliersTranslations[language][key]

  const [isLoading, setIsLoading] = useState(true)
  const [supplier, setSupplier] = useState<any>(null)
  const [supplierOrders, setSupplierOrders] = useState<any[]>([])

  useEffect(() => {
    // Simulate API call to fetch supplier data
    setTimeout(() => {
      const supplierData = suppliers.find((s) => s.id === params.id)
      if (supplierData) {
        setSupplier(supplierData)
        // Get purchase orders for this supplier
        const orders = purchaseOrders.filter((order) => order.supplierId === params.id)
        setSupplierOrders(orders)
      }
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {language === "fr" ? "Brouillon" : language === "en" ? "Draft" : "مسودة"}
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {language === "fr" ? "Envoyé" : language === "en" ? "Sent" : "مرسل"}
          </Badge>
        )
      case "received":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {language === "fr" ? "Reçu" : language === "en" ? "Received" : "مستلم"}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            {language === "fr" ? "Annulé" : language === "en" ? "Cancelled" : "ملغى"}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <Skeleton className="h-6 w-48 mb-2" />
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#9c2d40]/10 shadow-md md:col-span-2">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <Skeleton className="h-6 w-48 mb-2" />
              </CardHeader>
              <CardContent className="p-0">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageAnimation>
    )
  }

  if (!supplier) {
    return (
      <PageAnimation>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="outline" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {language === "fr"
                  ? "Fournisseur non trouvé"
                  : language === "en"
                    ? "Supplier not found"
                    : "المورد غير موجود"}
              </h2>
              <p className="text-muted-foreground">
                {language === "fr"
                  ? "Le fournisseur demandé n'existe pas ou a été supprimé."
                  : language === "en"
                    ? "The requested supplier does not exist or has been deleted."
                    : "المورد المطلوب غير موجود أو تم حذفه."}
              </p>
            </div>
          </div>
        </div>
      </PageAnimation>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Button variant="outline" onClick={() => router.back()} className="mr-4 h-9 gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{supplier.name}</h2>
              <p className="text-muted-foreground text-sm">
                {t("totalPurchases")}: {formatCurrency(supplier.totalPurchases)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:justify-start">
            <Button
              className="gap-1 bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
              asChild
            >
              <Link href={`/suppliers/edit/${supplier.id}`}>
                <Edit className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent rounded-t-lg">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">{t("supplierDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("email")}</p>
                <p className="font-medium">{supplier.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("phone")}</p>
                <p>{supplier.phone || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("address")}</p>
                <p>{supplier.address || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("contactPerson")}</p>
                <p>{supplier.contactPerson || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("totalPurchases")}</p>
                <p className="font-medium">{formatCurrency(supplier.totalPurchases)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#9c2d40]/10 shadow-md md:col-span-2">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg p-4">
              <CardTitle className="text-[#9c2d40]">{t("orderHistory")}</CardTitle>
              <CardDescription>
                {t("orderCount")
                  .replace("{count}", supplierOrders.length.toString())
                  .replace("{plural}", supplierOrders.length > 1 ? "s" : "")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                  <TableRow>
                    <TableHead className="font-medium">{t("number")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead className="text-right">{t("amount")}</TableHead>
                    <TableHead className="text-center">{t("status")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierOrders.length > 0 ? (
                    supplierOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.number}</TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100" asChild>
                            <Link href={`/purchases/view/${order.id}`}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">{t("view")}</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {t("noOrders")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageAnimation>
  )
}

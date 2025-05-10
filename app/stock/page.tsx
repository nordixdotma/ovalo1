"use client"

import { useState } from "react"
import { Plus, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import Link from "next/link"

import { products, stockMovements } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageAnimation } from "@/components/page-animation"
import { useSort } from "@/hooks/use-sort"
import { SortableHeader } from "@/components/sortable-header"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function StockPage() {
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.stock[typeof language], params?: Record<string, string | number>) => {
    let text = translations.stock[language][key] || key
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value))
      })
    }
    return text
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"inventory" | "movements">("inventory")

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter stock movements based on search term
  const filteredMovements = stockMovements.filter(
    (movement) =>
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting for products
  const {
    sortedData: sortedProducts,
    sort: productSort,
    toggleSort: toggleProductSort,
  } = useSort(filteredProducts, { column: "name", direction: "asc" })

  // Add sorting for movements
  const {
    sortedData: sortedMovements,
    sort: movementSort,
    toggleSort: toggleMovementSort,
  } = useSort(filteredMovements, { column: "date", direction: "desc" })

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Link href="/stock/add">
            <Button className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white">
              <Plus className="mr-2 h-4 w-4" />
              {t("newMovement")}
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center border rounded-lg overflow-hidden w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "inventory" ? "bg-[#9c2d40] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("inventory")}
            </button>
            <button
              onClick={() => setActiveTab("movements")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "movements" ? "bg-[#9c2d40] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t("movements")}
            </button>
          </div>
        </div>

        {activeTab === "inventory" ? (
          <Card>
            <CardHeader className="p-4">
              <CardTitle>{t("inventoryStatus")}</CardTitle>
              <CardDescription>{t("totalProducts", { count: sortedProducts.length })}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#9c2d40]/5">
                    <TableRow>
                      <SortableHeader
                        column="name"
                        label={t("product")}
                        sort={productSort}
                        toggleSort={toggleProductSort}
                        className="text-[#9c2d40]"
                      />
                      <SortableHeader
                        column="category"
                        label={t("category")}
                        sort={productSort}
                        toggleSort={toggleProductSort}
                      />
                      <SortableHeader
                        column="initialStock"
                        label={t("initialStock")}
                        sort={productSort}
                        toggleSort={toggleProductSort}
                        className="text-right"
                      />
                      <SortableHeader
                        column="currentStock"
                        label={t("currentStock")}
                        sort={productSort}
                        toggleSort={toggleProductSort}
                        className="text-right"
                      />
                      <TableHead className="text-center">{t("status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-[#9c2d40]/5">
                        <TableCell className="font-medium text-[#9c2d40]">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{product.initialStock}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              product.currentStock > 10
                                ? "text-green-600"
                                : product.currentStock > 0
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }
                          >
                            {product.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              product.currentStock > 10
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : product.currentStock > 0
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                            variant="secondary"
                          >
                            {product.currentStock > 10
                              ? t("inStock")
                              : product.currentStock > 0
                                ? t("lowStock")
                                : t("outOfStock")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="p-4">
              <CardTitle>{t("movements")}</CardTitle>
              <CardDescription>{t("totalMovements", { count: sortedMovements.length })}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#9c2d40]/5">
                    <TableRow>
                      <SortableHeader
                        column="date"
                        label={t("date")}
                        sort={movementSort}
                        toggleSort={toggleMovementSort}
                        className="text-[#9c2d40]"
                      />
                      <SortableHeader
                        column="productName"
                        label={t("product")}
                        sort={movementSort}
                        toggleSort={toggleMovementSort}
                      />
                      <SortableHeader
                        column="type"
                        label={t("type")}
                        sort={movementSort}
                        toggleSort={toggleMovementSort}
                        className="text-center"
                      />
                      <SortableHeader
                        column="quantity"
                        label={t("quantity")}
                        sort={movementSort}
                        toggleSort={toggleMovementSort}
                        className="text-right"
                      />
                      <SortableHeader
                        column="reason"
                        label={t("reason")}
                        sort={movementSort}
                        toggleSort={toggleMovementSort}
                        className="hidden md:table-cell"
                      />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMovements.map((movement) => (
                      <TableRow key={movement.id} className="hover:bg-[#9c2d40]/5">
                        <TableCell className="font-medium text-[#9c2d40]">{formatDate(movement.date)}</TableCell>
                        <TableCell className="font-medium">{movement.productName}</TableCell>
                        <TableCell className="text-center">
                          {movement.type === "in" ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
                              <ArrowUpCircle className="mr-1 h-3 w-3" />
                              {t("in")}
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
                              <ArrowDownCircle className="mr-1 h-3 w-3" />
                              {t("out")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{movement.quantity}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">{movement.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageAnimation>
  )
}

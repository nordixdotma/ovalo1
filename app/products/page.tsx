"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

import { products as initialProducts } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageAnimation } from "@/components/page-animation"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSort } from "@/hooks/use-sort"
import { SortableHeader } from "@/components/sortable-header"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function ProductsPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState(initialProducts)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: "",
    productName: "",
  })
  const { toast } = useToast()

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredProducts, { column: "name", direction: "asc" })

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteDialog({
      isOpen: true,
      productId,
      productName,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the product from the state
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== deleteDialog.productId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, productId: "", productName: "" })

    // Show success toast
    toast({
      title: t("products", "productDeleted", language),
      description: t("products", "productDeletedSuccess", language, { name: deleteDialog.productName }),
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, productId: "", productName: "" })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("products", "productCatalog", language)}</h2>
            <p className="text-muted-foreground">{t("products", "productCatalogDescription", language)}</p>
          </div>
          <Link href="/products/add">
            <Button className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white">
              <Plus className="mr-2 h-4 w-4" />
              {t("products", "addProduct", language)}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("products", "searchProduct", language)}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t("products", "productsList", language)}</CardTitle>
            <CardDescription>{t("products", "totalProducts", language, { count: sortedData.length })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="name"
                      label={t("products", "name", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader
                      column="description"
                      label={t("products", "description", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <SortableHeader
                      column="category"
                      label={t("products", "category", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                    />
                    <SortableHeader
                      column="price"
                      label={t("products", "price", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="unit"
                      label={t("products", "unit", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
                    />
                    <SortableHeader
                      column="currentStock"
                      label={t("products", "currentStock", language)}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <TableHead className="text-right">{t("products", "actions", language)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((product) => (
                    <TableRow key={product.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{product.name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                        {product.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-center">{product.unit}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/products/edit/${product.id}`}>
                                  <Button variant="ghost" size="icon" className="text-amber-600 hover:bg-amber-100">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">{t("common", "edit", language)}</span>
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common", "edit", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:bg-red-100"
                                  onClick={() => handleDeleteClick(product.id, product.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t("common", "delete", language)}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common", "delete", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t("products", "deleteConfirmation", language)}
        description={t("products", "deleteConfirmationMessage", language)}
        itemName={deleteDialog.productName}
      />
    </PageAnimation>
  )
}

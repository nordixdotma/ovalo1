"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, FileText } from "lucide-react"
import Link from "next/link"

import { suppliers as initialSuppliers } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSort } from "@/hooks/use-sort"
import { SortableHeader } from "@/components/sortable-header"

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { suppliersTranslations } from "@/lib/translations"

// Update the component to use translations
export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; supplierId: string; supplierName: string }>({
    isOpen: false,
    supplierId: "",
    supplierName: "",
  })
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = suppliersTranslations[language][key]
    if (!params) return translation
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredSuppliers, { column: "name", direction: "asc" })

  const handleDeleteClick = (supplierId: string, supplierName: string) => {
    setDeleteDialog({
      isOpen: true,
      supplierId,
      supplierName,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the supplier from the state
    setSuppliers((prevSuppliers) => prevSuppliers.filter((supplier) => supplier.id !== deleteDialog.supplierId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, supplierId: "", supplierName: "" })

    // Show success toast
    toast({
      title: t("supplierDeleted"),
      description: t("supplierDeletedDescription", { name: deleteDialog.supplierName }),
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, supplierId: "", supplierName: "" })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("supplierManagement")}</h2>
            <p className="text-muted-foreground">{t("supplierManagementDescription")}</p>
          </div>
          <Button
            className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
            asChild
          >
            <Link href="/suppliers/add">
              <Plus className="mr-2 h-4 w-4" />
              {t("addSupplier")}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchSupplier")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t("suppliersList")}</CardTitle>
            <CardDescription>{t("totalSuppliers", { count: sortedData.length })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="name"
                      label={t("name")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader column="email" label={t("email")} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader
                      column="phone"
                      label={t("phone")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <SortableHeader
                      column="contactPerson"
                      label={t("contact")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden lg:table-cell"
                    />
                    <SortableHeader
                      column="address"
                      label={t("address")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden lg:table-cell"
                    />
                    <SortableHeader
                      column="totalPurchases"
                      label={t("totalPurchases")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{supplier.name}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{supplier.phone}</TableCell>
                      <TableCell className="hidden lg:table-cell">{supplier.contactPerson || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                        {supplier.address || "-"}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(supplier.totalPurchases)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100" asChild>
                                  <Link href={`/suppliers/view/${supplier.id}`}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">{t("view")}</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("view")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-amber-600 hover:bg-amber-100"
                                  asChild
                                >
                                  <Link href={`/suppliers/edit/${supplier.id}`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">{t("edit")}</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("edit")}</p>
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
                                  onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t("delete")}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("delete")}</p>
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
        title={t("deleteSupplier")}
        description={t("deleteConfirmation")}
        itemName={deleteDialog.supplierName}
      />
    </PageAnimation>
  )
}

"use client"

import { useState } from "react"
import { Plus, Search, FileText, CreditCard, BanknoteIcon, CheckSquare } from "lucide-react"
import { useRouter } from "next/navigation"

import { payments as paymentsData } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageAnimation } from "@/components/page-animation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSort } from "@/hooks/use-sort"
import { SortableHeader } from "@/components/sortable-header"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations.payments[language]

  // Filter payments based on search term
  const filteredPayments = paymentsData.filter(
    (payment) =>
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredPayments, { column: "date", direction: "desc" })

  // Helper function to get payment method badge
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <BanknoteIcon className="mr-1 h-3 w-3" />
            {t.cash}
          </Badge>
        )
      case "bank":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <CreditCard className="mr-1 h-3 w-3" />
            {t.bank}
          </Badge>
        )
      case "check":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            <CheckSquare className="mr-1 h-3 w-3" />
            {t.check}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            {t.other}
          </Badge>
        )
    }
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
            <p className="text-muted-foreground">{t.description}</p>
          </div>
          <Button
            className="sm:w-auto w-full bg-[#9c2d40] hover:bg-[#8a2838]"
            onClick={() => router.push("/payments/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t.addPayment}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t.listTitle}</CardTitle>
            <CardDescription>{t.totalPayments.replace("{count}", sortedData.length.toString())}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="date"
                      label={t.date}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader column="invoiceNumber" label={t.invoice} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader column="clientName" label={t.client} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader
                      column="amount"
                      label={t.amount}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="method"
                      label={t.method}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
                    />
                    <SortableHeader
                      column="reference"
                      label={t.reference}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="text-[#9c2d40]">{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                      <TableCell>{payment.clientName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="text-center">{getMethodBadge(payment.method)}</TableCell>
                      <TableCell className="hidden md:table-cell">{payment.reference || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:bg-blue-100"
                                  onClick={() => router.push(`/payments/view/${payment.id}`)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">{t.view}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.view}</p>
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
    </PageAnimation>
  )
}

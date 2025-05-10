"use client"

import { useState } from "react"
import { Plus, Search, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

import { creditNotes } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSort } from "@/hooks/use-sort"
import { SortableHeader } from "@/components/sortable-header"
import { useLanguage } from "@/lib/contexts/language-context"
import { translations } from "@/lib/translations"

export default function AvoirsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.avoirs[typeof language], params?: Record<string, string | number>) => {
    let text = translations.avoirs[language][key] || key
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value))
      })
    }
    return text
  }

  // Filter credit notes based on search term
  const filteredCreditNotes = creditNotes.filter(
    (note) =>
      note.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredCreditNotes, { column: "date", direction: "desc" })

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button
            className="sm:w-auto w-full bg-[#9c2d40] hover:bg-[#8a2838]"
            onClick={() => router.push("/avoirs/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("createCreditNote")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
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
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t("creditNotesList")}</CardTitle>
            <CardDescription>{t("totalCreditNotes", { count: sortedData.length })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="number"
                      label={t("number")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader column="date" label={t("date")} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader column="invoiceNumber" label={t("invoice")} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader column="clientName" label={t("client")} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader
                      column="amount"
                      label={t("amount")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="reason"
                      label={t("reason")}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="hidden md:table-cell"
                    />
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((note) => (
                    <TableRow key={note.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{note.number}</TableCell>
                      <TableCell>{formatDate(note.date)}</TableCell>
                      <TableCell>{note.invoiceNumber}</TableCell>
                      <TableCell>{note.clientName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(note.amount)}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px] truncate">{note.reason}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:bg-blue-100"
                                  onClick={() => router.push(`/avoirs/view/${note.id}`)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">{t("view")}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("view")}</p>
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

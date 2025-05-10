"use client"

import { useState } from "react"
import { Plus, Search, FileText, Edit, Trash2, CheckCircle, XCircle, Clock, Bot, Download } from "lucide-react"
import { useRouter } from "next/navigation"

import { devis as initialDevis } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
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
import { devisTranslations } from "@/lib/translations/devis"

export default function DevisPage() {
  const { language } = useLanguage()
  const t = devisTranslations[language]

  const [searchTerm, setSearchTerm] = useState("")
  const [devis, setDevis] = useState(initialDevis)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; devisId: string; devisNumber: string }>({
    isOpen: false,
    devisId: "",
    devisNumber: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  // Filter devis based on search term
  const filteredDevis = devis.filter(
    (d) =>
      d.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add sorting functionality
  const { sortedData, sort, toggleSort } = useSort(filteredDevis, { column: "date", direction: "desc" })

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t.status.draft}
          </Badge>
        )
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="secondary">
            <FileText className="mr-1 h-3 w-3" />
            {t.status.sent}
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t.status.accepted}
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" variant="secondary">
            <XCircle className="mr-1 h-3 w-3" />
            {t.status.rejected}
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t.status.expired}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDeleteClick = (devisId: string, devisNumber: string) => {
    setDeleteDialog({
      isOpen: true,
      devisId,
      devisNumber,
    })
  }

  const handleDeleteConfirm = () => {
    // Remove the devis from the state
    setDevis((prevDevis) => prevDevis.filter((d) => d.id !== deleteDialog.devisId))

    // Close the dialog
    setDeleteDialog({ isOpen: false, devisId: "", devisNumber: "" })

    // Show success toast
    toast({
      title: t.quoteDeleted,
      description: `${t.quoteDeletedSuccess} "${deleteDialog.devisNumber}"`,
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, devisId: "", devisNumber: "" })
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t.management}</h2>
            <p className="text-muted-foreground">{t.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="sm:w-auto w-full bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
              onClick={() => router.push("/devis/add")}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.createQuote}
            </Button>
            <Button className="sm:w-auto w-full bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white">
              <Download className="mr-2 h-4 w-4" />
              {t.exportAll}
            </Button>
            <Button
              className="sm:w-auto w-full text-white relative overflow-hidden gradient-button"
              style={{
                background: "linear-gradient(90deg, #2563eb, #9c2d40, #2563eb)",
                backgroundSize: "200% 100%",
              }}
              onClick={() => router.push("/devis/ai-generator")}
            >
              <Bot className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10">{t.generateWithAI}</span>
              <style jsx>{`
                .gradient-button {
                  animation: gradientMove 3s linear infinite;
                }
                @keyframes gradientMove {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
              `}</style>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.search}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t.quotesList}</CardTitle>
            <CardDescription>{t.totalQuotes.replace("{count}", sortedData.length.toString())}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#9c2d40]/5">
                  <TableRow>
                    <SortableHeader
                      column="number"
                      label={t.number}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-[#9c2d40]"
                    />
                    <SortableHeader column="date" label={t.date} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader column="clientName" label={t.client} sort={sort} toggleSort={toggleSort} />
                    <SortableHeader
                      column="totalHT"
                      label={t.totalHT}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="totalTTC"
                      label={t.totalTTC}
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      column="status"
                      label="Status"
                      sort={sort}
                      toggleSort={toggleSort}
                      className="text-center"
                    />
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((d) => (
                    <TableRow key={d.id} className="hover:bg-[#9c2d40]/5">
                      <TableCell className="font-medium text-[#9c2d40]">{d.number}</TableCell>
                      <TableCell>{formatDate(d.date)}</TableCell>
                      <TableCell>{d.clientName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(d.totalHT)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(d.totalTTC)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(d.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:bg-blue-100"
                                  onClick={() => router.push(`/devis/view/${d.id}`)}
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

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-100">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">{t.export}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.export}</p>
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
                                  onClick={() => router.push(`/devis/edit/${d.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">{t.modify}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.modify}</p>
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
                                  onClick={() => handleDeleteClick(d.id, d.number)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t.delete}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.delete}</p>
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
        title={t.deleteQuote}
        description={t.deleteConfirmation}
        itemName={deleteDialog.devisNumber}
      />
    </PageAnimation>
  )
}

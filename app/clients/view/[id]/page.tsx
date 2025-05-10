"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, FileText } from "lucide-react"
import Link from "next/link"

import { clients, invoices } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageAnimation } from "@/components/page-animation"
import { Loader } from "@/components/loader"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function ClientView() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [clientInvoices, setClientInvoices] = useState<any[]>([])

  useEffect(() => {
    // Simulate API call
    const fetchData = () => {
      setTimeout(() => {
        const foundClient = clients.find((c) => c.id === params.id)
        if (foundClient) {
          setClient(foundClient)

          // Find client invoices
          const foundInvoices = invoices.filter((inv) => inv.clientId === foundClient.id)
          setClientInvoices(foundInvoices)
        }
        setLoading(false)
      }, 1000)
    }

    fetchData()
  }, [params.id])

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {t("clients", "draft", language)}
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {t("clients", "sent", language)}
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {t("clients", "paid", language)}
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            {t("clients", "overdue", language)}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <Loader />
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("clients", "clientNotFound", language)}</h2>
        <p className="text-muted-foreground mb-4">{t("clients", "clientNotFoundMessage", language)}</p>
        <Button onClick={() => router.push("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("clients", "backToClientsList", language)}
        </Button>
      </div>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push("/clients")} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              className="gap-1 bg-[#9c2d40]/10 text-[#9c2d40] border-[#9c2d40]/20 hover:bg-[#9c2d40] hover:text-white"
              asChild
            >
              <Link href={`/clients/edit/${client.id}`}>
                <Edit className="h-4 w-4" />
                {t("common", "edit", language)}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent pb-3">
              <CardTitle className="text-[#9c2d40] text-lg font-medium">
                {t("clients", "clientDetails", language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("clients", "email", language)}</p>
                <p className="font-medium">{client.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("clients", "phone", language)}</p>
                <p>{client.phone || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("clients", "address", language)}</p>
                <p>{client.address || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("clients", "rc", language)}</p>
                <p>{client.rc || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("clients", "totalSpent", language)}</p>
                <p className="font-medium text-[#9c2d40]">{formatCurrency(client.totalSpent)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("clients", "lastPurchase", language)}</p>
                <p>{formatDate(client.lastPurchase)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">{t("clients", "invoiceHistory", language)}</CardTitle>
              <CardDescription>
                {t("clients", "totalInvoices", language, { count: clientInvoices.length })}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gradient-to-r from-[#9c2d40]/10 to-transparent">
                  <TableRow>
                    <TableHead className="text-[#9c2d40] font-medium">
                      {t("clients", "invoiceNumber", language)}
                    </TableHead>
                    <TableHead>{t("clients", "date", language)}</TableHead>
                    <TableHead className="text-right">{t("clients", "amount", language)}</TableHead>
                    <TableHead className="text-center">{t("clients", "status", language)}</TableHead>
                    <TableHead className="text-right">{t("clients", "actions", language)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientInvoices.length > 0 ? (
                    clientInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-[#9c2d40]/5">
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:bg-blue-100"
                            onClick={() => router.push(`/invoices/view/${invoice.id}`)}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">{t("common", "view", language)}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {t("clients", "noInvoicesFound", language)}
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

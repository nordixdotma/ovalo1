"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// Import taxes from mock data
import { taxes } from "@/lib/mock-data"

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { expensesTranslations } from "@/lib/translations"

const expenseCategories = [
  "Fournitures",
  "Loyer",
  "Électricité",
  "Eau",
  "Internet",
  "Téléphone",
  "Assurance",
  "Déplacements",
  "Repas d'affaires",
  "Marketing",
  "Formation",
  "Équipement",
  "Maintenance",
  "Taxes",
  "Salaires",
  "Autre",
]

const paymentMethods = [
  { value: "cash", label: "Espèces" },
  { value: "bank", label: "Virement bancaire" },
  { value: "check", label: "Chèque" },
  { value: "card", label: "Carte bancaire" },
]

const statuses = [
  { value: "paid", label: "Payée" },
  { value: "pending", label: "En attente" },
  { value: "cancelled", label: "Annulée" },
]

// Update the component to use translations
export default function AddExpensePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = expensesTranslations[language][key]
    if (!params) return translation
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openSupplierCombobox, setOpenSupplierCombobox] = useState(false)

  // Mock suppliers for the combobox
  const suppliers = [
    { value: "supplier1", label: "Fournisseur A" },
    { value: "supplier2", label: "Fournisseur B" },
    { value: "supplier3", label: "Fournisseur C" },
    { value: "supplier4", label: "Fournisseur D" },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: t("expenseAdded"),
      description: t("expenseAddedDescription"),
    })

    setIsSubmitting(false)
    router.push("/depenses")
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("addExpenseTitle")}</h2>
          <p className="text-muted-foreground">{t("addExpenseDescription")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>{t("expenseInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="number">{t("expenseNumber")}</Label>
                  <Input id="number" placeholder="DEP-0001" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">{t("date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: fr }) : <span>{t("selectDate")}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={fr} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t("category")}</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">{t("supplier")}</Label>
                  <Popover open={openSupplierCombobox} onOpenChange={setOpenSupplierCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSupplierCombobox}
                        className="w-full justify-between"
                      >
                        <span>{t("selectSupplier")}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder={t("searchSupplier")} />
                        <CommandList>
                          <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
                          <CommandGroup>
                            {suppliers.map((supplier) => (
                              <CommandItem
                                key={supplier.value}
                                value={supplier.value}
                                onSelect={() => {
                                  setOpenSupplierCombobox(false)
                                }}
                              >
                                <Check className="mr-2 h-4 w-4 opacity-0" />
                                {supplier.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">{t("amountHT")}</Label>
                  <div className="relative">
                    <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">€</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">{t("vat")}</Label>
                  <Select defaultValue="20">
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectVAT")} />
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

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectPaymentMethod")} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {t(method.value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("status")}</Label>
                  <Select defaultValue="paid">
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {t(status.value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">{t("reference")}</Label>
                  <Input id="reference" placeholder={t("referencePlaceholder")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea id="description" placeholder={t("descriptionPlaceholder")} rows={3} />
              </div>
            </CardContent>
            <div className="px-6 py-4 flex justify-between">
              <Button variant="outline" onClick={() => router.push("/depenses")}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#9c2d40] hover:bg-[#7d2433] text-white">
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </PageAnimation>
  )
}

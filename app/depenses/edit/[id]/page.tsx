"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Loader } from "@/components/loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { expenses, taxes } from "@/lib/mock-data"

// Update the imports to include the translation system
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

export default function EditExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expense, setExpense] = useState<any>(null)
  const [openSupplierCombobox, setOpenSupplierCombobox] = useState(false)

  // Mock suppliers for the combobox
  const suppliers = [
    { value: "supplier1", label: "Fournisseur A" },
    { value: "supplier2", label: "Fournisseur B" },
    { value: "supplier3", label: "Fournisseur C" },
    { value: "supplier4", label: "Fournisseur D" },
  ]

  // Add the translation function in the component
  const { language } = useLanguage()
  type Translations = typeof expensesTranslations[typeof language];
  const t = (key: keyof Translations, params?: Record<string, string | number>) => {
      const translation = expensesTranslations[language][key];
      if (!params) return translation;
      return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation);
  };

  useEffect(() => {
    // Simulate API call to fetch expense data
    const fetchExpense = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const foundExpense = expenses.find((e) => e.id === params.id)

      if (foundExpense) {
        setExpense(foundExpense)
        setDate(new Date(foundExpense.date))
      }

      setIsLoading(false)
    }

    fetchExpense()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: t("expenseUpdated"),
      description: t("expenseUpdatedDescription"),
    })

    setIsSubmitting(false)
    router.push("/depenses")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader />
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h2 className="text-xl font-semibold">{t("expenseNotFound")}</h2>
        <p className="text-muted-foreground mt-2">{t("expenseNotFoundDescription")}</p>
        <Button className="mt-4" onClick={() => router.push("/depenses")}>
          {t("backToList")}
        </Button>
      </div>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("editExpenseTitle")}</h2>
          <p className="text-muted-foreground">{t("editExpenseDescription")}</p>
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
                  <Input id="number" defaultValue={expense.number} required />
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
                  <Select defaultValue={expense.category} required>
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
                        <span>{expense.supplier || t("selectSupplier")}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher un fournisseur..." />
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
                    <Input id="amount" type="number" step="0.01" min="0" defaultValue={expense.amount} required />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">€</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">{t("vat")}</Label>
                  <Select defaultValue={expense.taxRate.toString()}>
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
                  <Select defaultValue={expense.paymentMethod} required>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectPaymentMethod")} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("status")}</Label>
                  <Select defaultValue={expense.status}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">{t("reference")}</Label>
                  <Input id="reference" defaultValue={expense.reference || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea id="description" defaultValue={expense.description} rows={3} />
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

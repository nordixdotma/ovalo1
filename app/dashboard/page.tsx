"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  LineChartIcon,
  Users,
  DollarSign,
  CreditCard,
  Receipt,
  Calendar,
  ChevronDown,
  Check,
  CalendarRange,
  Clock,
  History,
  ArrowRight,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from "date-fns"
import { fr } from "date-fns/locale"

import { dashboardData } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

// Define the time filter options
type TimeFilterOption = {
  id: string
  label: string
  icon: React.ReactNode
  group: "recent" | "trimester" | "year" | "custom"
  getDateRange: () => { from: Date; to: Date }
}

export default function DashboardPage() {
  const { language } = useLanguage()
  const [data, setData] = useState(dashboardData)
  const [isClient, setIsClient] = useState(false)
  const [filteredData, setFilteredData] = useState(data)
  const [timeFilterOpen, setTimeFilterOpen] = useState(false)
  const [customDateOpen, setCustomDateOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subYears(new Date(), 1),
    to: new Date(),
  })
  const [selectedFilter, setSelectedFilter] = useState<string>("annee-precedente")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  // Define time filter options with icons and groups
  const timeFilterOptions: TimeFilterOption[] = [
    {
      id: "7-jours",
      label: t("dashboard", "last7Days", language),
      icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
      group: "recent",
      getDateRange: () => ({
        from: subDays(new Date(), 7),
        to: new Date(),
      }),
    },
    {
      id: "30-jours",
      label: t("dashboard", "last30Days", language),
      icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
      group: "recent",
      getDateRange: () => ({
        from: subDays(new Date(), 30),
        to: new Date(),
      }),
    },
    {
      id: "mois-courant",
      label: t("dashboard", "currentMonth", language),
      icon: <Calendar className="h-4 w-4 mr-2 text-green-500" />,
      group: "recent",
      getDateRange: () => ({
        from: startOfMonth(new Date()),
        to: new Date(),
      }),
    },
    {
      id: "mois-dernier",
      label: t("dashboard", "lastMonth", language),
      icon: <Calendar className="h-4 w-4 mr-2 text-green-500" />,
      group: "recent",
      getDateRange: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      id: "trimestre-1",
      label: t("dashboard", "quarter1", language),
      icon: <CalendarRange className="h-4 w-4 mr-2 text-purple-500" />,
      group: "trimester",
      getDateRange: () => ({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(new Date().getFullYear(), 2, 31),
      }),
    },
    {
      id: "trimestre-2",
      label: t("dashboard", "quarter2", language),
      icon: <CalendarRange className="h-4 w-4 mr-2 text-purple-500" />,
      group: "trimester",
      getDateRange: () => ({
        from: new Date(new Date().getFullYear(), 3, 1),
        to: new Date(new Date().getFullYear(), 5, 30),
      }),
    },
    {
      id: "trimestre-3",
      label: t("dashboard", "quarter3", language),
      icon: <CalendarRange className="h-4 w-4 mr-2 text-purple-500" />,
      group: "trimester",
      getDateRange: () => ({
        from: new Date(new Date().getFullYear(), 6, 1),
        to: new Date(new Date().getFullYear(), 8, 30),
      }),
    },
    {
      id: "trimestre-4",
      label: t("dashboard", "quarter4", language),
      icon: <CalendarRange className="h-4 w-4 mr-2 text-purple-500" />,
      group: "trimester",
      getDateRange: () => ({
        from: new Date(new Date().getFullYear(), 9, 1),
        to: new Date(new Date().getFullYear(), 11, 31),
      }),
    },
    {
      id: "annee-courante",
      label: t("dashboard", "currentYear", language),
      icon: <History className="h-4 w-4 mr-2 text-orange-500" />,
      group: "year",
      getDateRange: () => ({
        from: startOfYear(new Date()),
        to: new Date(),
      }),
    },
    {
      id: "annee-precedente",
      label: t("dashboard", "previousYear", language),
      icon: <History className="h-4 w-4 mr-2 text-orange-500" />,
      group: "year",
      getDateRange: () => ({
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1)),
      }),
    },
    {
      id: "personnaliser",
      label: t("dashboard", "customize", language),
      icon: <CalendarRange className="h-4 w-4 mr-2 text-[#9c2d40]" />,
      group: "custom",
      getDateRange: () => dateRange,
    },
  ]

  useEffect(() => {
    setIsClient(true)
    // Set default filter to "Année précédente"
    handleFilterChange("annee-precedente")
  }, [])

  // Function to handle filter change
  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId)
    setTimeFilterOpen(false)

    if (filterId === "personnaliser") {
      setCustomDateOpen(true)
      return
    }

    const option = timeFilterOptions.find((opt) => opt.id === filterId)
    if (option) {
      const newDateRange = option.getDateRange()
      setDateRange(newDateRange)

      // Here you would filter your data based on the date range
      // For now, we'll just simulate it by setting the filtered data
      filterDataByDateRange(newDateRange)
    }
  }

  // Function to apply custom date range
  const applyCustomDateRange = () => {
    if (customDateRange.from && customDateRange.to) {
      setDateRange({
        from: customDateRange.from,
        to: customDateRange.to,
      })

      filterDataByDateRange({
        from: customDateRange.from,
        to: customDateRange.to,
      })

      setCustomDateOpen(false)
    }
  }

  // Function to filter data by date range
  const filterDataByDateRange = (range: { from: Date; to: Date }) => {
    // In a real app, you would filter your data based on the date range
    // For this example, we'll just simulate it by adjusting some values

    // Calculate a multiplier based on the date range length (for demo purposes)
    const days = Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)))
    const multiplier = Math.min(1.5, Math.max(0.5, days / 365))

    // Apply the multiplier to the data and recalculate VAT correctly
    const totalRevenue = Math.round(data.totalRevenue * multiplier)
    const totalPayments = Math.round(data.totalPayments * multiplier)
    const totalExpenses = Math.round(data.totalExpenses * multiplier)

    // Proper VAT calculation
    const revenueHT = totalPayments / 1.2
    const vatFromRevenue = totalPayments - revenueHT
    const expensesHT = totalExpenses / 1.2
    const vatFromExpenses = totalExpenses - expensesHT
    const vatToPay = Math.round(vatFromRevenue - vatFromExpenses)

    setFilteredData({
      ...data,
      totalRevenue,
      totalPayments,
      totalExpenses,
      vatToPay,
    })
  }

  // Get the current filter label and icon
  const getCurrentFilter = () => {
    const option = timeFilterOptions.find((opt) => opt.id === selectedFilter)

    if (selectedFilter === "personnaliser" && dateRange.from && dateRange.to) {
      return {
        label: `${format(dateRange.from, "dd MMM yyyy", { locale: fr })} - ${format(dateRange.to, "dd MMM yyyy", {
          locale: fr,
        })}`,
        icon: <CalendarRange className="h-4 w-4 mr-2 text-[#9c2d40]" />,
      }
    }

    return {
      label: option?.label || t("dashboard", "filterByPeriod", language),
      icon: option?.icon || <Calendar className="h-4 w-4 mr-2" />,
    }
  }

  const currentFilter = getCurrentFilter()

  if (!isClient) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">{t("dashboard", "loading", language)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("dashboard", "dashboard", language)}</h1>
        <Popover open={timeFilterOpen} onOpenChange={setTimeFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[260px] justify-between border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40] hover:border-[#9c2d40]/30 transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {currentFilter.icon}
                <span className="truncate">{currentFilter.label}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Command className="rounded-lg border shadow-md">
              <CommandList>
                <CommandEmpty>{t("common", "noResults", language)}</CommandEmpty>

                <CommandGroup heading={t("dashboard", "recentPeriods", language)}>
                  {timeFilterOptions
                    .filter((option) => option.group === "recent")
                    .map((option) => (
                      <CommandItem
                        key={option.id}
                        onSelect={() => handleFilterChange(option.id)}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {selectedFilter === option.id && <Check className="h-4 w-4 ml-auto text-green-500" />}
                      </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading={t("dashboard", "quarters", language)}>
                  <div className="grid grid-cols-2 gap-1">
                    {timeFilterOptions
                      .filter((option) => option.group === "trimester")
                      .map((option) => (
                        <CommandItem
                          key={option.id}
                          onSelect={() => handleFilterChange(option.id)}
                          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                        >
                          {option.icon}
                          <span>{option.label}</span>
                          {selectedFilter === option.id && <Check className="h-4 w-4 ml-auto text-green-500" />}
                        </CommandItem>
                      ))}
                  </div>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading={t("dashboard", "years", language)}>
                  {timeFilterOptions
                    .filter((option) => option.group === "year")
                    .map((option) => (
                      <CommandItem
                        key={option.id}
                        onSelect={() => handleFilterChange(option.id)}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {selectedFilter === option.id && <Check className="h-4 w-4 ml-auto text-green-500" />}
                      </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleFilterChange("personnaliser")}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-[#9c2d40] font-medium"
                  >
                    <CalendarRange className="h-4 w-4 mr-2 text-[#9c2d40]" />
                    <span>{t("dashboard", "customize", language)}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Custom Date Range Dialog */}
      <Dialog open={customDateOpen} onOpenChange={setCustomDateOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-[#9c2d40]/10 to-[#9c2d40]/5 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-[#9c2d40]" />
              {t("dashboard", "selectCustomPeriod", language)}
            </DialogTitle>
          </DialogHeader>

          <div className="p-4">
            {/* Date Range Summary - Shown when both dates are selected */}
            {customDateRange.from && customDateRange.to && (
              <div className="mb-4 p-3 bg-[#9c2d40]/5 rounded-md border border-[#9c2d40]/20 text-sm flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">{t("dashboard", "selectedPeriod", language)}</p>
                  <div className="flex items-center gap-2 text-[#9c2d40] font-medium">
                    <span>{format(customDateRange.from, "dd MMM yyyy", { locale: fr })}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span>{format(customDateRange.to, "dd MMM yyyy", { locale: fr })}</span>
                  </div>
                </div>
                <Badge className="bg-[#9c2d40] hover:bg-[#9c2d40]/90">
                  {Math.round((customDateRange.to.getTime() - customDateRange.from.getTime()) / (1000 * 60 * 60 * 24))}{" "}
                  {t("dashboard", "days", language)}
                </Badge>
              </div>
            )}

            {/* Calendars in a more compact layout */}
            <div className="flex flex-col sm:flex-row gap-4 items-start justify-center">
              {/* From Date Calendar */}
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{t("dashboard", "startDate", language)}</Label>
                  {customDateRange.from && (
                    <Badge variant="outline" className="text-xs bg-[#9c2d40]/5 border-[#9c2d40]/20">
                      {format(customDateRange.from, "dd MMM yyyy", { locale: fr })}
                    </Badge>
                  )}
                </div>
                <div className="border rounded-md overflow-hidden">
                  <CalendarComponent
                    mode="single"
                    selected={customDateRange.from}
                    onSelect={(date) => setCustomDateRange({ ...customDateRange, from: date })}
                    disabled={(date) => date > new Date() || (customDateRange.to ? date > customDateRange.to : false)}
                    initialFocus
                    className="[&_.rdp-caption]:text-sm [&_.rdp-head_th]:text-xs [&_.rdp-button]:text-sm [&_.rdp]:mx-auto [&_.rdp-month]:w-full [&_.rdp-cell]:p-0 [&_.rdp-button]:p-1.5"
                  />
                </div>
              </div>

              {/* To Date Calendar */}
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{t("dashboard", "endDate", language)}</Label>
                  {customDateRange.to && (
                    <Badge variant="outline" className="text-xs bg-[#9c2d40]/5 border-[#9c2d40]/20">
                      {format(customDateRange.to, "dd MMM yyyy", { locale: fr })}
                    </Badge>
                  )}
                </div>
                <div className="border rounded-md overflow-hidden">
                  <CalendarComponent
                    mode="single"
                    selected={customDateRange.to}
                    onSelect={(date) => setCustomDateRange({ ...customDateRange, to: date })}
                    disabled={(date) =>
                      date > new Date() || (customDateRange.from ? date < customDateRange.from : false)
                    }
                    initialFocus
                    className="[&_.rdp-caption]:text-sm [&_.rdp-head_th]:text-xs [&_.rdp-button]:text-sm [&_.rdp]:mx-auto [&_.rdp-month]:w-full [&_.rdp-cell]:p-0 [&_.rdp-button]:p-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 border-t flex flex-row justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setCustomDateOpen(false)}>
              {t("dashboard", "cancel", language)}
            </Button>
            <Button
              onClick={applyCustomDateRange}
              disabled={!customDateRange.from || !customDateRange.to}
              className="bg-[#9c2d40] hover:bg-[#9c2d40]/90"
            >
              {t("dashboard", "apply", language)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard", "revenueHT", language)}</CardTitle>
            <div className="rounded-full bg-blue-500 p-1 sm:p-2 text-white">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-blue-700">
              {formatCurrency(filteredData.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard", "paymentsTTC", language)}</CardTitle>
            <div className="rounded-full bg-green-500 p-1 sm:p-2 text-white">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-green-700">
              {formatCurrency(filteredData.totalPayments)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard", "expensesTTC", language)}</CardTitle>
            <div className="rounded-full bg-orange-500 p-1 sm:p-2 text-white">
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-orange-700">
              {formatCurrency(filteredData.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 pt-2 sm:pt-3">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("dashboard", "vatToPay", language)}</CardTitle>
            <div className="rounded-full bg-purple-500 p-1 sm:p-2 text-white">
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-purple-700">
              {formatCurrency(filteredData.vatToPay)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-base sm:text-lg md:text-xl">
              {t("dashboard", "monthlyRevenue", language)}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t("dashboard", "monthlyRevenueDescription", language)}
            </CardDescription>
          </div>
          <div className="rounded-full bg-[#9c2d40] p-1.5 sm:p-2 text-white self-end sm:self-auto">
            <LineChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "8px",
                    fontSize: "12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                  formatter={(value) => [formatCurrency(value as number), ""]}
                  labelStyle={{
                    color: "#4b5563",
                    fontWeight: 500,
                    marginBottom: "2px",
                  }}
                  itemStyle={{
                    color: "#9c2d40",
                    padding: 0,
                  }}
                  separator=""
                  labelFormatter={(label) => label}
                  wrapperStyle={{ zIndex: 1000 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name=""
                  stroke="#9c2d40"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#9c2d40", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#9c2d40", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1500}
                  animationBegin={0}
                  animationEasing="ease-in-out"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Clients Table */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center p-3 sm:p-4 md:p-6">
          <div>
            <CardTitle className="text-base sm:text-lg md:text-xl">{t("dashboard", "topClients", language)}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t("dashboard", "topClientsDescription", language)}
            </CardDescription>
          </div>
          <div className="ml-auto rounded-full bg-blue-500 p-1.5 sm:p-2 text-white">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </CardHeader>
        <CardContent className="py-2 px-0 sm:py-4 md:py-6">
          <div className="overflow-x-auto -mx-0">
            <Table className="min-w-[650px]">
              <TableHeader className="bg-[#9c2d40]/5">
                <TableRow>
                  <TableHead className="text-[#9c2d40]">{t("dashboard", "name", language)}</TableHead>
                  <TableHead>{t("dashboard", "email", language)}</TableHead>
                  <TableHead>{t("dashboard", "phone", language)}</TableHead>
                  <TableHead className="text-right">{t("dashboard", "totalAmount", language)}</TableHead>
                  <TableHead className="text-right">{t("dashboard", "invoices", language)}</TableHead>
                  <TableHead>{t("dashboard", "lastPurchase", language)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-[#9c2d40]">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-right">{formatCurrency(client.totalSpent)}</TableCell>
                    <TableCell className="text-right">{client.invoiceCount}</TableCell>
                    <TableCell>{formatDate(client.lastPurchase)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

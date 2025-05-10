"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Save, Upload, X, Plus, Trash2, Lock, Database, Settings, Building, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PageAnimation } from "@/components/page-animation"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

// Add the import for useLanguage and t
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

// Import taxes from mock data
import { taxes as mockTaxes } from "@/lib/mock-data"

// Update the SettingsPage function to use the language context
export default function SettingsPage() {
  const { language, setLanguage } = useLanguage()

  const [companyData, setCompanyData] = useState({
    name: "Acme Inc",
    ice: "123456789",
    rc: "RC123456",
    address: "123 Main St, City",
    phone: "+1234567890",
    website: "https://acme.example.com",
    email: "contact@acme.example.com",
    logo: null as string | null,
  })

  // Replace the useState for taxSettings with:
  const [taxSettings, setTaxSettings] = useState({
    taxes: mockTaxes.map((tax) => ({
      id: tax.id,
      name: tax.name,
      rate: tax.rate.toString(),
    })),
  })

  const [preferenceSettings, setPreferenceSettings] = useState({
    language: "fr",
    currency: "mad",
    numberFormat: "1 234,56",
    dateFormat: "DD/MM/YYYY",
    timezone: "Africa/Casablanca",
    quoteValidity: "30",
    paymentTerms: "Paiement à effectuer sous 30 jours",
    catalogOptions: {
      showBarcodes: true,
      showBrands: true,
      showImages: true,
    },
  })

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  })

  const [storageUsage, setStorageUsage] = useState({
    total: 1000, // MB
    used: 450, // MB
    breakdown: {
      invoices: 150, // MB
      quotes: 100, // MB
      images: 120, // MB
      signatures: 30, // MB
      other: 50, // MB
    },
  })

  const [pdfSettings, setPdfSettings] = useState({
    headerText: "Merci pour votre confiance",
    footerText: "Paiement à effectuer sous 30 jours",
    termsAndConditions: "Conditions générales de vente disponibles sur notre site web.",
    signature: null as string | null,
  })

  const [isLoading, setIsLoading] = useState<{
    company: boolean
    pdf: boolean
    tax: boolean
    preferences: boolean
    security: boolean
  }>({
    company: false,
    pdf: false,
    tax: false,
    preferences: false,
    security: false,
  })

  const [hasChanges, setHasChanges] = useState<{
    company: boolean
    pdf: boolean
    tax: boolean
    preferences: boolean
    security: boolean
  }>({
    company: false,
    pdf: false,
    tax: false,
    preferences: false,
    security: false,
  })

  // Original data to compare against
  const [originalCompanyData, setOriginalCompanyData] = useState(companyData)
  const [originalPdfSettings, setOriginalPdfSettings] = useState(pdfSettings)
  const [originalTaxSettings, setOriginalTaxSettings] = useState(taxSettings)
  const [originalPreferenceSettings, setOriginalPreferenceSettings] = useState(preferenceSettings)
  const [originalSecuritySettings, setOriginalSecuritySettings] = useState(securitySettings)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompanyData((prev) => ({ ...prev, [name]: value }))
    setHasChanges((prev) => ({ ...prev, company: true }))
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPdfSettings((prev) => ({ ...prev, [name]: value }))
    setHasChanges((prev) => ({ ...prev, pdf: true }))
  }

  const handleTaxChange = (id: string, field: string, value: string) => {
    setTaxSettings((prev) => ({
      ...prev,
      taxes: prev.taxes.map((tax) => (tax.id === id ? { ...tax, [field]: value } : tax)),
    }))
    setHasChanges((prev) => ({ ...prev, tax: true }))
  }

  const handleAddTax = () => {
    const newId = `tax-${Date.now()}`
    setTaxSettings((prev) => ({
      ...prev,
      taxes: [...prev.taxes, { id: newId, name: "", rate: "" }],
    }))
    setHasChanges((prev) => ({ ...prev, tax: true }))
  }

  const handleRemoveTax = (id: string) => {
    setTaxSettings((prev) => ({
      ...prev,
      taxes: prev.taxes.filter((tax) => tax.id !== id),
    }))
    setHasChanges((prev) => ({ ...prev, tax: true }))
  }

  // Update the handlePreferenceChange function to handle language changes
  const handlePreferenceChange = (name: string, value: any) => {
    if (name === "language") {
      setLanguage(value as "fr" | "ar" | "en")
    }

    setPreferenceSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
    setHasChanges((prev) => ({ ...prev, preferences: true }))
  }

  const handleCatalogOptionChange = (name: string, value: boolean) => {
    setPreferenceSettings((prev) => ({
      ...prev,
      catalogOptions: {
        ...prev.catalogOptions,
        [name]: value,
      },
    }))
    setHasChanges((prev) => ({ ...prev, preferences: true }))
  }

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
    setHasChanges((prev) => ({ ...prev, security: true }))
  }

  const handleTwoFactorChange = (checked: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, twoFactorEnabled: checked }))
    setHasChanges((prev) => ({ ...prev, security: true }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCompanyData((prev) => ({ ...prev, logo: event.target?.result as string }))
        setHasChanges((prev) => ({ ...prev, company: true }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPdfSettings((prev) => ({ ...prev, signature: event.target?.result as string }))
        setHasChanges((prev) => ({ ...prev, pdf: true }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (section: "company" | "pdf" | "tax" | "preferences" | "security") => {
    setIsLoading((prev) => ({ ...prev, [section]: true }))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update original data after successful save
    if (section === "company") {
      setOriginalCompanyData(companyData)
    } else if (section === "pdf") {
      setOriginalPdfSettings(pdfSettings)
    } else if (section === "tax") {
      setOriginalTaxSettings(taxSettings)
    } else if (section === "preferences") {
      setOriginalPreferenceSettings(preferenceSettings)
    } else if (section === "security") {
      setOriginalSecuritySettings(securitySettings)
      // Clear password fields after save
      setSecuritySettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    }

    setIsLoading((prev) => ({ ...prev, [section]: false }))
    setHasChanges((prev) => ({ ...prev, [section]: false }))

    toast({
      title: t("settings", "settingsSaved", language),
      description: t("settings", `${section}SettingsSaved`, language),
      duration: 3000,
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()

        // Determine which tab is active and save that section
        const activeTab = document.querySelector('[data-state="active"][role="tab"]')?.getAttribute("value")
        if (activeTab === "company" && hasChanges.company) {
          handleSave("company")
        } else if (activeTab === "pdf" && hasChanges.pdf) {
          handleSave("pdf")
        } else if (activeTab === "tax" && hasChanges.tax) {
          handleSave("tax")
        } else if (activeTab === "preferences" && hasChanges.preferences) {
          handleSave("preferences")
        } else if (activeTab === "security" && hasChanges.security) {
          handleSave("security")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasChanges])

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-[#9c2d40]">{t("settings", "settings", language)}</h2>
          <p className="text-muted-foreground">{t("settings", "configureSettings", language)}</p>
        </div>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#9c2d40]/5">
            <TabsTrigger value="company" className="data-[state=active]:bg-[#9c2d40] data-[state=active]:text-white">
              <Building className="h-4 w-4 mr-2" />
              {t("settings", "company", language)}
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-[#9c2d40] data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              {t("settings", "pdfDocuments", language)}
            </TabsTrigger>
            <TabsTrigger value="tax" className="data-[state=active]:bg-[#9c2d40] data-[state=active]:text-white">
              <span className="flex items-center">
                <span className="mr-2">%</span>
                {t("settings", "taxes", language)}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-[#9c2d40] data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              {t("settings", "preferences", language)}
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#9c2d40] data-[state=active]:text-white">
              <Lock className="h-4 w-4 mr-2" />
              {t("settings", "security", language)}
            </TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-[#9c2d40] data-[state=active]:text-white">
              <Database className="h-4 w-4 mr-2" />
              {t("settings", "storage", language)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-6">
            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <CardTitle className="text-[#9c2d40]">{t("settings", "companyInfo", language)}</CardTitle>
                <CardDescription>{t("settings", "companyInfoDesc", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("settings", "companyName", language)}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={companyData.name}
                      onChange={handleCompanyChange}
                      placeholder={t("settings", "companyName", language)}
                      className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ice">{t("settings", "ice", language)}</Label>
                    <Input
                      id="ice"
                      name="ice"
                      value={companyData.ice}
                      onChange={handleCompanyChange}
                      placeholder={t("settings", "ice", language)}
                      className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rc">{t("settings", "rc", language)}</Label>
                    <Input
                      id="rc"
                      name="rc"
                      value={companyData.rc}
                      onChange={handleCompanyChange}
                      placeholder={t("settings", "rc", language)}
                      className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("settings", "phone", language)}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={companyData.phone}
                      onChange={handleCompanyChange}
                      placeholder={t("settings", "phone", language)}
                      className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("settings", "email", language)}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={companyData.email}
                      onChange={handleCompanyChange}
                      placeholder={t("settings", "email", language)}
                      className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">{t("settings", "website", language)}</Label>
                    <Input
                      id="website"
                      name="website"
                      value={companyData.website}
                      onChange={handleCompanyChange}
                      placeholder={t("settings", "website", language)}
                      className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t("settings", "address", language)}</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={companyData.address}
                    onChange={handleCompanyChange}
                    placeholder={t("settings", "address", language)}
                    rows={3}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">{t("settings", "companyLogo", language)}</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-24 w-24 rounded-md border border-[#9c2d40]/20 flex items-center justify-center bg-gray-50 overflow-hidden">
                      {companyData.logo ? (
                        <img
                          src={companyData.logo || "/placeholder.svg"}
                          alt={t("settings", "companyLogo", language)}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">{t("settings", "companyLogo", language)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <input
                        type="file"
                        id="logo-upload"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40]"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {t("settings", "uploadLogo", language)}
                      </Button>
                      {companyData.logo && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setCompanyData((prev) => ({ ...prev, logo: null }))}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {t("settings", "delete", language)}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-end py-4">
                <Button
                  className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 transition-all"
                  onClick={() => handleSave("company")}
                  disabled={!hasChanges.company || isLoading.company}
                >
                  {isLoading.company ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                      {t("settings", "saving", language)}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("settings", "save", language)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pdf" className="mt-6">
            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <CardTitle className="text-[#9c2d40]">{t("settings", "pdfCustomization", language)}</CardTitle>
                <CardDescription>{t("settings", "pdfCustomizationDesc", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="headerText">{t("settings", "headerText", language)}</Label>
                  <Input
                    id="headerText"
                    name="headerText"
                    value={pdfSettings.headerText}
                    onChange={handlePdfChange}
                    placeholder={t("settings", "headerText", language)}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerText">{t("settings", "footerText", language)}</Label>
                  <Input
                    id="footerText"
                    name="footerText"
                    value={pdfSettings.footerText}
                    onChange={handlePdfChange}
                    placeholder={t("settings", "footerText", language)}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">{t("settings", "termsAndConditions", language)}</Label>
                  <Textarea
                    id="termsAndConditions"
                    name="termsAndConditions"
                    value={pdfSettings.termsAndConditions}
                    onChange={handlePdfChange}
                    placeholder={t("settings", "termsAndConditions", language)}
                    rows={4}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signature">{t("settings", "signature", language)}</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-24 w-48 rounded-md border border-[#9c2d40]/20 flex items-center justify-center bg-gray-50 overflow-hidden">
                      {pdfSettings.signature ? (
                        <img
                          src={pdfSettings.signature || "/placeholder.svg"}
                          alt={t("settings", "signature", language)}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">{t("settings", "signature", language)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <input
                        type="file"
                        id="signature-upload"
                        ref={signatureInputRef}
                        onChange={handleSignatureUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40]"
                        onClick={() => signatureInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {t("settings", "uploadSignature", language)}
                      </Button>
                      {pdfSettings.signature && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setPdfSettings((prev) => ({ ...prev, signature: null }))}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {t("settings", "delete", language)}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-end py-4">
                <Button
                  className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 transition-all"
                  onClick={() => handleSave("pdf")}
                  disabled={!hasChanges.pdf || isLoading.pdf}
                >
                  {isLoading.pdf ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                      {t("settings", "saving", language)}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("settings", "save", language)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="mt-6">
            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <CardTitle className="text-[#9c2d40]">{t("settings", "taxManagement", language)}</CardTitle>
                <CardDescription>{t("settings", "taxManagementDesc", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  {taxSettings.taxes.map((tax, index) => (
                    <div key={tax.id} className="flex items-center gap-4 p-4 border rounded-md bg-white">
                      <div className="flex-1">
                        <Label htmlFor={`tax-name-${tax.id}`} className="text-sm font-medium mb-1 block">
                          {t("settings", "taxName", language)}
                        </Label>
                        <Input
                          id={`tax-name-${tax.id}`}
                          value={tax.name}
                          onChange={(e) => handleTaxChange(tax.id, "name", e.target.value)}
                          placeholder="Ex: TVA, TPS, etc."
                          className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                        />
                      </div>
                      <div className="w-32">
                        <Label htmlFor={`tax-rate-${tax.id}`} className="text-sm font-medium mb-1 block">
                          {t("settings", "taxRate", language)}
                        </Label>
                        <Input
                          id={`tax-rate-${tax.id}`}
                          type="number"
                          value={tax.rate}
                          onChange={(e) => handleTaxChange(tax.id, "rate", e.target.value)}
                          placeholder="20"
                          className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="border-red-200 hover:bg-red-50 hover:text-red-600 h-10 w-10"
                          onClick={() => handleRemoveTax(tax.id)}
                          disabled={taxSettings.taxes.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("settings", "delete", language)}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40] w-full"
                  onClick={handleAddTax}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("settings", "addTax", language)}
                </Button>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-end py-4">
                <Button
                  className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 transition-all"
                  onClick={() => handleSave("tax")}
                  disabled={!hasChanges.tax || isLoading.tax}
                >
                  {isLoading.tax ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                      {t("settings", "saving", language)}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("settings", "save", language)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <CardTitle className="text-[#9c2d40]">{t("settings", "generalPreferences", language)}</CardTitle>
                <CardDescription>{t("settings", "generalPreferencesDesc", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("settings", "language", language)}</Label>
                    <Select
                      value={language}
                      onValueChange={(value) => handlePreferenceChange("language", value as "fr" | "ar" | "en")}
                    >
                      <SelectTrigger id="language" className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                        <SelectValue placeholder={t("settings", "selectLanguage", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">{t("settings", "french", language)}</SelectItem>
                        <SelectItem value="ar">{t("settings", "arabic", language)}</SelectItem>
                        <SelectItem value="en">{t("settings", "english", language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("settings", "currency", language)}</Label>
                    <Select
                      value={preferenceSettings.currency}
                      onValueChange={(value) => handlePreferenceChange("currency", value)}
                    >
                      <SelectTrigger id="currency" className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                        <SelectValue placeholder={t("settings", "selectCurrency", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mad">{t("settings", "mad", language)}</SelectItem>
                        <SelectItem value="eur">{t("settings", "eur", language)}</SelectItem>
                        <SelectItem value="usd">{t("settings", "usd", language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberFormat">{t("settings", "numberFormat", language)}</Label>
                    <Select
                      value={preferenceSettings.numberFormat}
                      onValueChange={(value) => handlePreferenceChange("numberFormat", value)}
                    >
                      <SelectTrigger id="numberFormat" className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                        <SelectValue placeholder={t("settings", "selectNumberFormat", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 234,56">1 234,56 (espace comme séparateur de milliers)</SelectItem>
                        <SelectItem value="1,234.56">1,234.56 (virgule comme séparateur de milliers)</SelectItem>
                        <SelectItem value="1.234,56">1.234,56 (point comme séparateur de milliers)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">{t("settings", "dateFormat", language)}</Label>
                    <Select
                      value={preferenceSettings.dateFormat}
                      onValueChange={(value) => handlePreferenceChange("dateFormat", value)}
                    >
                      <SelectTrigger id="dateFormat" className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                        <SelectValue placeholder={t("settings", "selectDateFormat", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t("settings", "timezone", language)}</Label>
                    <Select
                      value={preferenceSettings.timezone}
                      onValueChange={(value) => handlePreferenceChange("timezone", value)}
                    >
                      <SelectTrigger id="timezone" className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                        <SelectValue placeholder={t("settings", "selectTimezone", language)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Casablanca">Casablanca (GMT+1)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (GMT+1/+2)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT+0/+1)</SelectItem>
                        <SelectItem value="America/New_York">New York (GMT-5/-4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quoteValidity">{t("settings", "quoteValidity", language)}</Label>
                    <Input
                      id="quoteValidity"
                      type="number"
                      value={preferenceSettings.quoteValidity}
                      onChange={(e) => handlePreferenceChange("quoteValidity", e.target.value)}
                      placeholder="30"
                      className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">{t("settings", "paymentTerms", language)}</Label>
                  <Textarea
                    id="paymentTerms"
                    value={preferenceSettings.paymentTerms}
                    onChange={(e) => handlePreferenceChange("paymentTerms", e.target.value)}
                    placeholder={t("settings", "paymentTerms", language)}
                    rows={3}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("settings", "catalogOptions", language)}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showBarcodes" className="cursor-pointer">
                        {t("settings", "showBarcodes", language)}
                      </Label>
                      <Switch
                        id="showBarcodes"
                        checked={preferenceSettings.catalogOptions.showBarcodes}
                        onCheckedChange={(checked) => handleCatalogOptionChange("showBarcodes", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showBrands" className="cursor-pointer">
                        {t("settings", "showBrands", language)}
                      </Label>
                      <Switch
                        id="showBrands"
                        checked={preferenceSettings.catalogOptions.showBrands}
                        onCheckedChange={(checked) => handleCatalogOptionChange("showBrands", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showImages" className="cursor-pointer">
                        {t("settings", "showImages", language)}
                      </Label>
                      <Switch
                        id="showImages"
                        checked={preferenceSettings.catalogOptions.showImages}
                        onCheckedChange={(checked) => handleCatalogOptionChange("showImages", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-end py-4">
                <Button
                  className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 transition-all"
                  onClick={() => handleSave("preferences")}
                  disabled={!hasChanges.preferences || isLoading.preferences}
                >
                  {isLoading.preferences ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                      {t("settings", "saving", language)}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("settings", "save", language)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <CardTitle className="text-[#9c2d40]">{t("settings", "accountSecurity", language)}</CardTitle>
                <CardDescription>{t("settings", "accountSecurityDesc", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("settings", "changePassword", language)}</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t("settings", "currentPassword", language)}</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={securitySettings.currentPassword}
                        onChange={handleSecurityChange}
                        placeholder="••••••••"
                        className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t("settings", "newPassword", language)}</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={securitySettings.newPassword}
                        onChange={handleSecurityChange}
                        placeholder="••••••••"
                        className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t("settings", "confirmPassword", language)}</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={securitySettings.confirmPassword}
                        onChange={handleSecurityChange}
                        placeholder="••••••••"
                        className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">{t("settings", "twoFactorAuth", language)}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("settings", "enableTwoFactor", language)}</p>
                      <p className="text-sm text-muted-foreground">{t("settings", "twoFactorDesc", language)}</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={handleTwoFactorChange}
                      className="data-[state=checked]:bg-[#9c2d40]"
                    />
                  </div>
                  {securitySettings.twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-[#9c2d40]/5 rounded-md">
                      <p className="text-sm">{t("settings", "twoFactorEnabled", language)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-end py-4">
                <Button
                  className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 transition-all"
                  onClick={() => handleSave("security")}
                  disabled={!hasChanges.security || isLoading.security}
                >
                  {isLoading.security ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                      {t("settings", "saving", language)}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("settings", "save", language)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="mt-6">
            <Card className="border-[#9c2d40]/10 shadow-md">
              <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
                <CardTitle className="text-[#9c2d40]">{t("settings", "storageUsage", language)}</CardTitle>
                <CardDescription>{t("settings", "storageUsageDesc", language)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t("settings", "usedSpace", language)}</span>
                      <span className="font-medium">
                        {storageUsage.used} Mo / {storageUsage.total} Mo
                      </span>
                    </div>
                    <Progress
                      value={(storageUsage.used / storageUsage.total) * 100}
                      className="h-2 bg-gray-100 [&>div]:bg-[#9c2d40]"
                    />
                    <p className="text-sm text-muted-foreground">
                      {Math.round((storageUsage.used / storageUsage.total) * 100)}%{" "}
                      {t("settings", "ofYourStorage", language)}
                    </p>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-4">{t("settings", "storageBreakdown", language)}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-[#9c2d40] mr-2"></div>
                          <span>{t("settings", "invoices", language)}</span>
                        </div>
                        <span>{storageUsage.breakdown.invoices} Mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                          <span>{t("settings", "quotes", language)}</span>
                        </div>
                        <span>{storageUsage.breakdown.quotes} Mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span>{t("settings", "images", language)}</span>
                        </div>
                        <span>{storageUsage.breakdown.images} Mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span>{t("settings", "signatures", language)}</span>
                        </div>
                        <span>{storageUsage.breakdown.signatures} Mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                          <span>{t("settings", "others", language)}</span>
                        </div>
                        <span>{storageUsage.breakdown.other} Mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h4 className="font-medium text-amber-800 mb-2">{t("settings", "needMoreSpace", language)}</h4>
                      <p className="text-sm text-amber-700">{t("settings", "approachingLimit", language)}</p>
                      <Button className="mt-3 bg-amber-600 hover:bg-amber-700">
                        {t("settings", "upgradeStorage", language)}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-between py-4">
                <Button variant="outline" className="border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40]">
                  {t("settings", "clearCache", language)}
                </Button>
                <Button className="bg-[#9c2d40] hover:bg-[#9c2d40]/90 transition-all">
                  <Save className="mr-2 h-4 w-4" />
                  {t("settings", "backupData", language)}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageAnimation>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Bot,
  FileUp,
  MessageSquare,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  RefreshCw,
  Download,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { clients } from "@/lib/mock-data"
import { useLanguage } from "@/lib/contexts/language-context"
import { devisTranslations } from "@/lib/translations/devis"

// Sample industry templates
const getIndustryTemplates = (t: any) => [
  {
    id: "construction",
    name: t.construction.name,
    description: t.construction.description,
    items: [
      { productName: "Travaux de maçonnerie", description: "Fondations et murs", unitPrice: 3500, quantity: 1 },
      { productName: "Travaux de plomberie", description: "Installation complète", unitPrice: 2200, quantity: 1 },
      { productName: "Travaux d'électricité", description: "Mise aux normes", unitPrice: 1800, quantity: 1 },
      { productName: "Matériaux de construction", description: "Ciment, sable, etc.", unitPrice: 1200, quantity: 1 },
    ],
  },
  {
    id: "it",
    name: t.it.name,
    description: t.it.description,
    items: [
      {
        productName: "Développement de site web",
        description: "Site vitrine responsive",
        unitPrice: 2500,
        quantity: 1,
      },
      { productName: "Maintenance annuelle", description: "Mises à jour et support", unitPrice: 1200, quantity: 1 },
      { productName: "Hébergement", description: "Hébergement cloud sécurisé", unitPrice: 300, quantity: 12 },
      { productName: "Formation", description: "Formation à l'utilisation du CMS", unitPrice: 500, quantity: 2 },
    ],
  },
  {
    id: "design",
    name: t.design.name,
    description: t.design.description,
    items: [
      {
        productName: "Création de logo",
        description: "Design de logo et charte graphique",
        unitPrice: 800,
        quantity: 1,
      },
      { productName: "Campagne marketing", description: "Campagne sur réseaux sociaux", unitPrice: 1500, quantity: 1 },
      { productName: "Impression flyers", description: "Impression 1000 flyers A5", unitPrice: 250, quantity: 1 },
      { productName: "Séance photo", description: "Séance photo professionnelle", unitPrice: 600, quantity: 1 },
    ],
  },
]

// Keywords for smart suggestions
const keywordMap = {
  peinture: { description: "Travaux de peinture intérieure", unitPrice: 25, unit: "m²" },
  carrelage: { description: "Fourniture et pose de carrelage", unitPrice: 45, unit: "m²" },
  plomberie: { description: "Travaux de plomberie", unitPrice: 60, unit: "heure" },
  électricité: { description: "Installation électrique", unitPrice: 55, unit: "heure" },
  maçonnerie: { description: "Travaux de maçonnerie", unitPrice: 70, unit: "m²" },
  menuiserie: { description: "Travaux de menuiserie", unitPrice: 65, unit: "heure" },
  isolation: { description: "Isolation thermique", unitPrice: 40, unit: "m²" },
  toiture: { description: "Réfection de toiture", unitPrice: 80, unit: "m²" },
  fenêtre: { description: "Fourniture et pose de fenêtre", unitPrice: 450, unit: "unité" },
  porte: { description: "Fourniture et pose de porte", unitPrice: 350, unit: "unité" },
  parquet: { description: "Fourniture et pose de parquet", unitPrice: 55, unit: "m²" },
  béton: { description: "Coulage de béton", unitPrice: 120, unit: "m³" },
  cloison: { description: "Installation de cloison", unitPrice: 85, unit: "m²" },
  placoplatre: { description: "Pose de placoplatre", unitPrice: 35, unit: "m²" },
  rénovation: { description: "Travaux de rénovation générale", unitPrice: 500, unit: "jour" },
}

export default function AIGeneratorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = devisTranslations[language]
  const industryTemplates = getIndustryTemplates(t)

  const [activeTab, setActiveTab] = useState("description")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDevis, setGeneratedDevis] = useState<any | null>(null)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isEditingItem, setIsEditingItem] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState("")
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isExcelValid, setIsExcelValid] = useState(true)
  const [excelError, setExcelError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to analyze text and extract relevant information
  const analyzeText = (text: string) => {
    // Reset progress
    setProgress(0)
    setAnalysisStage(t.analyzing)

    // Start progress animation
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress === 30) {
        setAnalysisStage(t.identifying)
      } else if (currentProgress === 60) {
        setAnalysisStage(t.estimating)
      } else if (currentProgress === 85) {
        setAnalysisStage(t.generating)
      } else if (currentProgress >= 100) {
        clearInterval(interval)
        generateDevisFromDescription(text)
      }
    }, 100)
  }

  // Function to generate devis based on description
  const generateDevisFromDescription = (text: string) => {
    // Extract keywords from text
    const lowerText = text.toLowerCase()
    const items: { id: string; productName: string; description: string; unitPrice: number; quantity: number; totalHT: number }[] = []

    // Check for renovation keywords
    if (lowerText.includes("rénovation") || lowerText.includes("rénover")) {
      if (lowerText.includes("appartement") || lowerText.includes("maison")) {
        // Extract surface area if mentioned
        const surfaceMatch = lowerText.match(/(\d+)\s*m²/)
        const surface = surfaceMatch ? Number.parseInt(surfaceMatch[1]) : 80 // Default to 80m² if not specified

        // Add renovation items based on mentioned elements
        if (lowerText.includes("peinture")) {
          items.push({
            id: uuidv4(),
            productName: "Peinture murale",
            description: "Peinture acrylique premium pour murs intérieurs",
            unitPrice: 25.0,
            quantity: surface,
            totalHT: 25.0 * surface,
          })
        }

        if (lowerText.includes("carrelage")) {
          // Estimate carrelage for 30% of total surface if it's for kitchen and bathroom
          const carrelageSurface =
            lowerText.includes("cuisine") && lowerText.includes("salle de bain")
              ? Math.round(surface * 0.3)
              : Math.round(surface * 0.15)

          items.push({
            id: uuidv4(),
            productName: "Carrelage sol",
            description: "Carrelage céramique 60x60cm",
            unitPrice: 45.0,
            quantity: carrelageSurface,
            totalHT: 45.0 * carrelageSurface,
          })

          items.push({
            id: uuidv4(),
            productName: "Main d'œuvre - Carrelage",
            description: "Pose de carrelage par m²",
            unitPrice: 40.0,
            quantity: carrelageSurface,
            totalHT: 40.0 * carrelageSurface,
          })
        }

        if (lowerText.includes("électricité") || lowerText.includes("electrique")) {
          items.push({
            id: uuidv4(),
            productName: "Rénovation électrique",
            description: "Mise aux normes installation électrique",
            unitPrice: 1500.0,
            quantity: 1,
            totalHT: 1500.0,
          })
        }

        if (lowerText.includes("plomberie")) {
          items.push({
            id: uuidv4(),
            productName: "Travaux de plomberie",
            description: "Remplacement tuyauterie et installation sanitaires",
            unitPrice: 1200.0,
            quantity: 1,
            totalHT: 1200.0,
          })
        }
      }
    }

    // Check for construction keywords
    if (lowerText.includes("construction") || lowerText.includes("extension")) {
      // Extract surface area if mentioned
      const surfaceMatch = lowerText.match(/(\d+)\s*m²/)
      const surface = surfaceMatch ? Number.parseInt(surfaceMatch[1]) : 20 // Default to 20m² if not specified

      if (lowerText.includes("fondation") || lowerText.includes("fondations")) {
        items.push({
          id: uuidv4(),
          productName: "Fondations",
          description: "Travaux de fondation et terrassement",
          unitPrice: 180.0,
          quantity: surface,
          totalHT: 180.0 * surface,
        })
      }

      if (lowerText.includes("mur") || lowerText.includes("parpaing")) {
        items.push({
          id: uuidv4(),
          productName: "Construction murs",
          description: "Élévation des murs en parpaings",
          unitPrice: 120.0,
          quantity: surface,
          totalHT: 120.0 * surface,
        })
      }

      if (lowerText.includes("isolation")) {
        items.push({
          id: uuidv4(),
          productName: "Isolation thermique",
          description: "Isolation des murs et combles",
          unitPrice: 45.0,
          quantity: surface,
          totalHT: 45.0 * surface,
        })
      }

      if (lowerText.includes("toiture") || lowerText.includes("toit")) {
        items.push({
          id: uuidv4(),
          productName: "Toiture",
          description: "Construction et couverture de toiture",
          unitPrice: 160.0,
          quantity: surface,
          totalHT: 160.0 * surface,
        })
      }

      if (lowerText.includes("fenêtre") || lowerText.includes("fenetre") || lowerText.includes("vitrage")) {
        // Estimate 1 window per 10m²
        const windowCount = Math.max(1, Math.round(surface / 10))
        items.push({
          id: uuidv4(),
          productName: "Fenêtres double vitrage",
          description: "Fourniture et pose de fenêtres double vitrage",
          unitPrice: 450.0,
          quantity: windowCount,
          totalHT: 450.0 * windowCount,
        })
      }
    }

    // If no specific items were identified, add generic items based on keywords
    if (items.length === 0) {
      // Check for common keywords
      Object.entries(keywordMap).forEach(([keyword, details]) => {
        if (lowerText.includes(keyword)) {
          // Try to extract quantity if mentioned with the keyword
          const quantityRegex = new RegExp(`(\\d+)\\s*(?:${details.unit})?\\s*(?:de)?\\s*${keyword}`, "i")
          const quantityMatch = lowerText.match(quantityRegex)
          const quantity = quantityMatch ? Number.parseInt(quantityMatch[1]) : 1

          items.push({
            id: uuidv4(),
            productName: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            description: details.description,
            unitPrice: details.unitPrice,
            quantity: quantity,
            totalHT: details.unitPrice * quantity,
          })
        }
      })

      // If still no items, add default items
      if (items.length === 0) {
        items.push({
          id: uuidv4(),
          productName: "Prestation de service",
          description: "Prestation selon description du projet",
          unitPrice: 1200.0,
          quantity: 1,
          totalHT: 1200.0,
        })
      }
    }

    // Calculate totals
    const totalHT = items.reduce((sum, item) => sum + (item.totalHT || 0), 0)
    const totalTTC = totalHT * 1.2 // 20% TVA

    // Create the devis object
    const newDevis = {
      id: uuidv4(),
      clientName: "Client à sélectionner",
      clientId: "",
      date: new Date().toISOString(),
      status: "draft",
      items: items,
      totalHT: totalHT,
      totalTTC: totalTTC,
    }

    setGeneratedDevis(newDevis)
  }

  // Function to handle description form submission
  const handleDescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast({
        title: t.descriptionRequired,
        description: t.descriptionRequired,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    analyzeText(description)
  }

  // Function to handle file upload and processing
  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: t.fileRequired,
        description: t.fileRequired,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setAnalysisStage(t.extracting)

    // Validate file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!["xlsx", "xls", "csv"].includes(fileExtension || "")) {
      setIsExcelValid(false)
      setExcelError(t.unsupportedFormat)
      setIsGenerating(false)
      return
    }

    // Simulate file processing with progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress === 30) {
        setAnalysisStage(t.extracting)
      } else if (currentProgress === 60) {
        setAnalysisStage(t.validating)
      } else if (currentProgress === 85) {
        setAnalysisStage(t.generating)
      } else if (currentProgress >= 100) {
        clearInterval(interval)
        processExcelFile()
      }
    }, 100)
  }

  // Simulate Excel file processing
  const processExcelFile = () => {
    // Generate mock items based on file name to simulate different content
    const items: { id: string; productName: string; description: string; unitPrice: number; quantity: number; totalHT?: number }[] = []
    const fileName = file?.name.toLowerCase() || ""

    if (fileName.includes("construction") || fileName.includes("batiment")) {
      items.push(
        ...(industryTemplates.find((t) => t.id === "construction")?.items.map((item) => ({
          ...item,
          id: uuidv4(),
          totalHT: item.unitPrice * item.quantity,
        })) || [])
      )
    } else if (fileName.includes("it") || fileName.includes("web") || fileName.includes("informatique")) {
      items.push(
        ...(industryTemplates.find((t) => t.id === "it")?.items.map((item) => ({
          ...item,
          id: uuidv4(),
          totalHT: item.unitPrice * item.quantity,
        })) || [])
      )
    } else if (fileName.includes("design") || fileName.includes("marketing")) {
      items.push(
        ...(industryTemplates.find((t) => t.id === "design")?.items.map((item) => ({
          ...item,
          id: uuidv4(),
          totalHT: item.unitPrice * item.quantity,
        })) || [])
      )
    } else {
      // Generic items if no specific template matches
      items.push(
        {
          id: uuidv4(),
          productName: "Article 1",
          description: "Description de l'article 1",
          unitPrice: 500.0,
          quantity: 2,
          totalHT: 1000.0,
        },
        {
          id: uuidv4(),
          productName: "Article 2",
          description: "Description de l'article 2",
          unitPrice: 750.0,
          quantity: 1,
          totalHT: 750.0,
        },
        {
          id: uuidv4(),
          productName: "Article 3",
          description: "Description de l'article 3",
          unitPrice: 300.0,
          quantity: 3,
          totalHT: 900.0,
        },
      )
    }

    // Add items with their totals
    items.forEach((item) => {
      item.id = uuidv4() // Ensure id is assigned to objects with the correct type
      item.totalHT = item.unitPrice * item.quantity // Ensure totalHT is calculated
      item.totalHT = item.unitPrice * item.quantity
    })

    // Calculate totals
    const totalHT = items.reduce((sum, item) => sum + (item.totalHT ?? 0), 0)
    const totalTTC = totalHT * 1.2 // 20% TVA

    // Create the devis object
    const newDevis = {
      id: uuidv4(),
      clientName: "Client à sélectionner",
      clientId: "",
      date: new Date().toISOString(),
      status: "draft",
      items: items,
      totalHT: totalHT,
      totalTTC: totalTTC,
    }

    setGeneratedDevis(newDevis)
    setIsGenerating(false)
  }

  // Function to handle saving the devis
  const handleSaveDevis = () => {
    if (!generatedDevis.clientId) {
      toast({
        title: t.clientRequired,
        description: t.clientRequired,
        variant: "destructive",
      })
      return
    }

    toast({
      title: t.quoteCreated,
      description: t.quoteCreatedSuccess,
    })
    router.push("/devis")
  }

  // Function to handle editing the devis
  const handleEditDevis = () => {
    if (!generatedDevis.clientId) {
      toast({
        title: t.clientRequired,
        description: t.clientRequired,
        variant: "destructive",
      })
      return
    }

    toast({
      title: t.quoteModified,
      description: t.quoteModifiedSuccess,
    })
    router.push("/devis/add")
  }

  // Function to handle adding a new item
  const handleAddItem = () => {
    setEditingItem({
      id: uuidv4(),
      productName: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
      totalHT: 0,
    })
    setIsEditingItem(true)
  }

  // Function to handle editing an existing item
  const handleEditItem = (item: any) => {
    setEditingItem({ ...item })
    setIsEditingItem(true)
  }

  // Function to handle deleting an item
  const handleDeleteItem = (itemId: string) => {
    if (!generatedDevis) return

    const updatedItems = generatedDevis.items.filter((item: any) => item.id !== itemId)
    const totalHT = updatedItems.reduce((sum: number, item: any) => sum + item.totalHT, 0)
    const totalTTC = totalHT * 1.2

    setGeneratedDevis({
      ...generatedDevis,
      items: updatedItems,
      totalHT,
      totalTTC,
    })

    toast({
      title: t.itemDeleted,
      description: t.itemDeletedSuccess,
    })
  }

  // Function to save edited item
  const handleSaveItem = () => {
    if (!editingItem.productName || editingItem.unitPrice <= 0 || editingItem.quantity <= 0) {
      toast({
        title: t.incompleteInfo,
        description: t.incompleteInfo,
        variant: "destructive",
      })
      return
    }

    // Calculate total
    editingItem.totalHT = editingItem.unitPrice * editingItem.quantity

    // Update or add the item
    const existingItemIndex = generatedDevis.items.findIndex((item: any) => item.id === editingItem.id)
    let updatedItems

    if (existingItemIndex >= 0) {
      updatedItems = [...generatedDevis.items]
      updatedItems[existingItemIndex] = editingItem
    } else {
      updatedItems = [...generatedDevis.items, editingItem]
    }

    // Recalculate totals
    const totalHT = updatedItems.reduce((sum: number, item: any) => sum + item.totalHT, 0)
    const totalTTC = totalHT * 1.2

    setGeneratedDevis({
      ...generatedDevis,
      items: updatedItems,
      totalHT,
      totalTTC,
    })

    setIsEditingItem(false)
    setEditingItem(null)

    toast({
      title: existingItemIndex >= 0 ? t.itemModified : t.itemAdded,
      description: existingItemIndex >= 0 ? t.itemModifiedSuccess : t.itemAddedSuccess,
    })
  }

  // Function to handle client selection
  const handleClientChange = (value: string) => {
    const selectedClientData = clients.find((client) => client.id === value)

    if (selectedClientData && generatedDevis) {
      setSelectedClient(value)
      setGeneratedDevis({
        ...generatedDevis,
        clientId: value,
        clientName: selectedClientData.name,
      })
    }
  }

  // Function to handle template selection
  const handleSelectTemplate = (templateId: string) => {
    const template = industryTemplates.find((t) => t.id === templateId)

    if (template) {
      // Create items with unique IDs
      const items = template.items.map((item) => ({
        ...item,
        id: uuidv4(),
        totalHT: item.unitPrice * item.quantity,
      }))

      // Calculate totals
      const totalHT = items.reduce((sum, item) => sum + item.totalHT, 0)
      const totalTTC = totalHT * 1.2

      // Create the devis object
      const newDevis = {
        id: uuidv4(),
        clientName: "Client à sélectionner",
        clientId: "",
        date: new Date().toISOString(),
        status: "draft",
        items: items,
        totalHT: totalHT,
        totalTTC: totalTTC,
      }

      setGeneratedDevis(newDevis)
      setShowTemplateDialog(false)
    }
  }

  // Function to download template Excel file
  const handleDownloadTemplate = () => {
    // Create CSV content
    const csvContent = `Produit/Service,Description,Prix unitaire,Quantité
Produit 1,Description du produit 1,100,1
Produit 2,Description du produit 2,200,2
Produit 3,Description du produit 3,150,3`

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "modele_devis.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: t.templateDownloaded,
      description: t.templateDownloaded,
    })
  }

  // Function to reset file input
  const handleResetFile = () => {
    setFile(null)
    setIsExcelValid(true)
    setExcelError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Update suggestions based on description
  useEffect(() => {
    if (description.length > 5) {
      const words = description.toLowerCase().split(/\s+/)
      const newSuggestions: string[] = []

      for (const word of words) {
        if (word.length >= 3) {
          for (const [keyword, details] of Object.entries(keywordMap)) {
            if (keyword.includes(word) && !newSuggestions.includes(keyword)) {
              newSuggestions.push(keyword)
              if (newSuggestions.length >= 3) break
            }
          }
        }
        if (newSuggestions.length >= 3) break
      }

      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [description])

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/devis")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{t.aiGenerator}</h2>
        </div>

        {!generatedDevis ? (
          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t.describeProject}
              </TabsTrigger>
              <TabsTrigger value="excel" className="flex items-center">
                <FileUp className="mr-2 h-4 w-4" />
                {t.importExcel}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.generateFromDescription}</CardTitle>
                  <CardDescription>{t.descriptionExplanation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDescriptionSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">{t.projectDescription}</Label>
                      <Textarea
                        id="description"
                        placeholder="Ex: Je veux un devis pour la rénovation d'un appartement de 80m² avec carrelage, peinture, électricité et plomberie."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />

                      {suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">{t.suggestions}</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                              <Button
                                key={suggestion}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  setDescription(description + (description.endsWith(" ") ? "" : " ") + suggestion)
                                }
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isGenerating ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{analysisStage}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : (
                      <Button type="submit" className="w-full bg-[#9c2d40] hover:bg-[#8a2838]">
                        <Bot className="mr-2 h-4 w-4" />
                        {t.generate}
                      </Button>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" onClick={() => setShowTemplateDialog(true)} className="text-sm">
                    <RefreshCw className="mr-2 h-3 w-3" />
                    {t.useTemplate}
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t.exampleDescriptions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm">
                      Je veux un devis pour la rénovation d'un appartement de 80m² avec carrelage dans la cuisine et la
                      salle de bain, peinture dans toutes les pièces, rénovation électrique complète et remplacement de
                      la plomberie dans la salle de bain.
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-[#9c2d40]"
                      onClick={() =>
                        setDescription(
                          "Je veux un devis pour la rénovation d'un appartement de 80m² avec carrelage dans la cuisine et la salle de bain, peinture dans toutes les pièces, rénovation électrique complète et remplacement de la plomberie dans la salle de bain.",
                        )
                      }
                    >
                      {t.useExample}
                    </Button>
                  </div>
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm">
                      Devis pour construction d'une extension de maison de 20m² avec fondations, murs en parpaings,
                      isolation, électricité, fenêtres double vitrage et toiture.
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-[#9c2d40]"
                      onClick={() =>
                        setDescription(
                          "Devis pour construction d'une extension de maison de 20m² avec fondations, murs en parpaings, isolation, électricité, fenêtres double vitrage et toiture.",
                        )
                      }
                    >
                      {t.useExample}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="excel" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.importExcelFile}</CardTitle>
                  <CardDescription>{t.excelExplanation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">{t.excelFile}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="file"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            setFile(e.target.files?.[0] || null)
                            setIsExcelValid(true)
                            setExcelError("")
                          }}
                          ref={fileInputRef}
                          className={!isExcelValid ? "border-red-500" : ""}
                        />
                        {file && (
                          <Button type="button" variant="outline" size="icon" onClick={handleResetFile}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {!isExcelValid && <p className="text-sm text-red-500">{excelError}</p>}
                      <p className="text-sm text-muted-foreground">{t.acceptedFormats}</p>
                    </div>

                    {isGenerating ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{analysisStage}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : (
                      <Button type="submit" className="w-full bg-[#9c2d40] hover:bg-[#8a2838]" disabled={!file}>
                        <FileUp className="mr-2 h-4 w-4" />
                        {t.analyzeGenerate}
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t.excelFormat}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{t.excelFormatExplanation}</p>
                  <div className="rounded-md bg-muted p-4">
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>{t.productService} (nom de l'article)</li>
                      <li>{t.description} (description détaillée)</li>
                      <li>{t.unitPrice} (en €)</li>
                      <li>{t.quantity}</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    {t.downloadTemplate}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-[#9c2d40]" />
                  {t.generatedByAI}
                </CardTitle>
                <CardDescription>{t.generatedExplanation}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client" className="text-sm font-medium text-muted-foreground">
                      {t.client}
                    </Label>
                    <Select value={generatedDevis.clientId} onValueChange={handleClientChange}>
                      <SelectTrigger id="client" className="mt-1">
                        <SelectValue
                          placeholder={
                            language === "fr"
                              ? "Sélectionner un client"
                              : language === "en"
                                ? "Select a client"
                                : "اختر عميل"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.date}</p>
                    <p className="text-lg font-semibold mt-1">{new Date(generatedDevis.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-[#9c2d40]/5">
                      <TableRow>
                        <TableHead className="text-[#9c2d40]">{t.productService}</TableHead>
                        <TableHead>{t.description}</TableHead>
                        <TableHead className="text-right">{t.unitPrice}</TableHead>
                        <TableHead className="text-right">{t.quantity}</TableHead>
                        <TableHead className="text-right">{t.totalHT}</TableHead>
                        <TableHead className="w-[100px]">{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedDevis.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalHT)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-2">
                          <Button variant="outline" size="sm" onClick={handleAddItem} className="text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            {t.addNewItem}
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">
                          {t.totalHT}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(generatedDevis.totalHT)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">
                          {t.tva} (20%)
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(generatedDevis.totalTTC - generatedDevis.totalHT)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          {t.totalTTC}
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#9c2d40]">
                          {formatCurrency(generatedDevis.totalTTC)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button className="bg-[#9c2d40] hover:bg-[#8a2838] sm:flex-1" onClick={handleSaveDevis}>
                    <Save className="mr-2 h-4 w-4" />
                    {t.saveQuote}
                  </Button>
                  <Button variant="outline" className="sm:flex-1" onClick={handleEditDevis}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t.editBeforeSave}
                  </Button>
                  <Button
                    variant="outline"
                    className="sm:flex-1"
                    onClick={() => {
                      setGeneratedDevis(null)
                      setDescription("")
                      setFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.startOver}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.aiSuggestions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                  <h4 className="font-medium text-blue-800 mb-2">{t.tipsForQuote}</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-blue-700">
                    <li>Considérez d'ajouter une garantie pour les travaux de rénovation</li>
                    <li>Les prix des matériaux peuvent varier, pensez à ajouter une clause de révision</li>
                    <li>Pour ce type de projet, un acompte de 30% est généralement demandé</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialog for template selection */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.chooseTemplate}</DialogTitle>
            <DialogDescription>{t.selectTemplate}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {industryTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing items */}
      <Dialog open={isEditingItem} onOpenChange={setIsEditingItem}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem && editingItem.productName ? t.editItem : t.addNewItemTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="productName">{t.productService}</Label>
              <Input
                id="productName"
                value={editingItem?.productName || ""}
                onChange={(e) => setEditingItem({ ...editingItem, productName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={editingItem?.description || ""}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">{t.unitPrice}</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem?.unitPrice || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, unitPrice: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t.quantity}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={editingItem?.quantity || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.totalHT}</Label>
              <div className="p-2 border rounded-md bg-muted">
                {formatCurrency((editingItem?.unitPrice || 0) * (editingItem?.quantity || 0))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingItem(false)
                setEditingItem(null)
              }}
            >
              {t.cancel}
            </Button>
            <Button onClick={handleSaveItem}>
              <Check className="mr-2 h-4 w-4" />
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageAnimation>
  )
}

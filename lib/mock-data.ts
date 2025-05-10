// Mock data for dashboard and other pages

// Types
export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  contactPerson?: string
  notes?: string
  taxId?: string
  rc?: string
  website?: string
  totalSpent: number
  invoiceCount: number
  lastPurchase: string
  createdAt: string
}

export interface MonthlyRevenue {
  month: string
  revenue: number
}

export interface DashboardData {
  totalRevenue: number // Chiffre d'affaires (HT)
  totalPayments: number // Encaissements (TTC)
  totalExpenses: number // Dépenses (TTC)
  vatToPay: number // TVA à payer
  monthlyRevenue: MonthlyRevenue[]
  topClients: Client[]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  initialStock: number
  currentStock: number
  category: string
  sku?: string
  barcode?: string
  minStockLevel?: number
  maxStockLevel?: number
  costPrice?: number
  taxRate?: number
  isActive: boolean
  createdAt: string
  images?: string[]
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  date: string
  type: "in" | "out"
  quantity: number
  reason: string
  reference?: string
  notes?: string
  performedBy?: string
  locationFrom?: string
  locationTo?: string
  unitCost?: number
  totalCost?: number
}

// Update the DevisItem interface to include tva
export interface DevisItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalHT: number
  tva?: number // Add this property
}

// Update the Devis interface to include notes and other missing properties
export interface Devis {
  id: string
  number: string
  date: string
  dueDate?: string
  clientId: string
  clientName: string
  items: DevisItem[]
  totalHT: number
  totalTTC: number
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  notes?: string // Add this property
  reference?: string // Add this property
  paymentTerms?: string // Add this property
  validityPeriod?: string // Add this property
}

export interface Invoice {
  id: string
  number: string
  date: string
  dueDate?: string
  clientId: string
  clientName: string
  devisId?: string
  items: DevisItem[]
  totalHT: number
  totalTTC: number
  status: "draft" | "sent" | "paid" | "partial" | "overdue"
  paidAmount: number
}

export interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  clientId: string
  clientName: string
  date: string
  amount: number
  method: "cash" | "bank" | "check" | "other"
  reference?: string
}

export interface CreditNote {
  id: string
  number: string
  date: string
  invoiceId: string
  invoiceNumber: string
  clientId: string
  clientName: string
  amount: number
  reason: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  contactPerson?: string
  totalPurchases: number
}

export interface PurchaseOrder {
  id: string
  number: string
  date: string
  supplierId: string
  supplierName: string
  items: PurchaseItem[]
  totalAmount: number
  status: "draft" | "sent" | "received" | "cancelled"
}

export interface PurchaseItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface User {
  id: string
  fullName: string
  email: string
  role: "Admin" | "Editor" | "Viewer"
  lastLogin?: string
  status: "active" | "invited" | "inactive"
}

// Add the Tax interface after the User interface
export interface Tax {
  id: string
  name: string
  rate: number
  isDefault?: boolean
}

// Add the Expense interface after the User interface
export interface Expense {
  id: string
  number: string
  date: string
  category: string
  description: string
  amount: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  paymentMethod: "cash" | "bank" | "check" | "other"
  reference?: string
  supplier?: string
  status: "paid" | "pending" | "cancelled"
  attachments?: string[]
}

// Generate mock data
const generateMockData = (): {
  dashboardData: DashboardData
  clients: Client[]
  products: Product[]
  stockMovements: StockMovement[]
  devis: Devis[]
  invoices: Invoice[]
  payments: Payment[]
  creditNotes: CreditNote[]
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  users: User[]
  expenses: Expense[]
  taxes: Tax[]
} => {
  // Generate monthly revenue for the last 12 months
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

  const currentMonth = new Date().getMonth()

  const monthlyRevenue: MonthlyRevenue[] = [
    { month: "Jan", revenue: 25000 },
    { month: "Fév", revenue: 32000 },
    { month: "Mar", revenue: 28000 },
    { month: "Avr", revenue: 35000 },
    { month: "Mai", revenue: 42000 },
    { month: "Juin", revenue: 38000 },
    { month: "Juil", revenue: 45000 },
    { month: "Août", revenue: 40000 },
    { month: "Sep", revenue: 48000 },
    { month: "Oct", revenue: 52000 },
    { month: "Nov", revenue: 58000 },
    { month: "Déc", revenue: 65000 },
  ]

  const clients: Client[] = [
    {
      id: "client-1",
      name: "Société Générale",
      email: "contact@societe-generale.com",
      phone: "+212 522 123 456",
      address: "123 Avenue Hassan II",
      city: "Casablanca",
      postalCode: "20000",
      country: "Maroc",
      contactPerson: "Mohammed Alaoui",
      notes: "Client important - Secteur bancaire",
      taxId: "ICE123456789",
      rc: "RC123456",
      website: "www.societe-generale.ma",
      totalSpent: 125000,
      invoiceCount: 12,
      lastPurchase: "2023-04-15",
      createdAt: "2022-01-15",
    },
  ]

  const products: Product[] = [
    {
      id: "product-1",
      name: "Ordinateur portable HP",
      description: "HP EliteBook 840 G8, i7, 16GB RAM, 512GB SSD",
      price: 12000,
      unit: "pièce",
      initialStock: 50,
      currentStock: 32,
      category: "Informatique",
      sku: "HP-EB840-G8",
      barcode: "5901234123457",
      minStockLevel: 10,
      maxStockLevel: 100,
      costPrice: 10000,
      taxRate: 20,
      isActive: true,
      createdAt: "2022-01-10",
      images: ["/images/products/laptop.jpg"],
    },
  ]

  const stockMovements: StockMovement[] = [
    {
      id: "movement-1",
      productId: "product-1",
      productName: "Ordinateur portable HP",
      date: "2023-05-10",
      type: "out",
      quantity: 2,
      reason: "Vente - Facture #F2023-042",
      reference: "F2023-042",
      notes: "Livraison effectuée le même jour",
      performedBy: "Admin User",
      locationFrom: "Entrepôt principal",
      locationTo: "Client",
      unitCost: 10000,
      totalCost: 20000,
    },
  ]

  const devis: Devis[] = [
    {
      id: "devis-1",
      number: "D2023-045",
      date: "2023-05-15",
      clientId: "client-1",
      clientName: "Société Générale",
      items: [
        {
          id: "item-1",
          productId: "product-1",
          productName: "Ordinateur portable HP",
          quantity: 5,
          unitPrice: 12000,
          totalHT: 60000,
        },
      ],
      totalHT: 60000,
      totalTTC: 72000,
      status: "sent",
    },
  ]

  const invoices: Invoice[] = [
    {
      id: "invoice-1",
      number: "F2023-042",
      date: "2023-05-12",
      clientId: "client-1",
      clientName: "Société Générale",
      devisId: "devis-1",
      items: [
        {
          id: "item-9",
          productId: "product-1",
          productName: "Ordinateur portable HP",
          quantity: 2,
          unitPrice: 12000,
          totalHT: 24000,
        },
      ],
      totalHT: 24000,
      totalTTC: 28800,
      status: "sent",
      paidAmount: 0,
    },
  ]

  // Generate payments
  const payments: Payment[] = [
    {
      id: "payment-1",
      invoiceId: "invoice-1",
      invoiceNumber: "F2023-042",
      clientId: "client-1",
      clientName: "Société Générale",
      date: "2023-05-15",
      amount: 28800,
      method: "bank",
      reference: "VIR-20230515-001",
    },
  ]

  // Generate credit notes
  const creditNotes: CreditNote[] = [
    {
      id: "credit-1",
      number: "A2023-005",
      date: "2023-05-18",
      invoiceId: "invoice-1",
      invoiceNumber: "F2023-042",
      clientId: "client-1",
      clientName: "Société Générale",
      amount: 3500,
      reason: "Retour d'un produit défectueux",
    },
  ]

  // Generate suppliers
  const suppliers: Supplier[] = [
    {
      id: "supplier-1",
      name: "HP Maroc",
      email: "contact@hp.ma",
      phone: "+212 522 123 456",
      address: "Casablanca, Maroc",
      contactPerson: "Mohammed Alami",
      totalPurchases: 150000,
    },
  ]

  // Generate purchase orders
  const purchaseOrders: PurchaseOrder[] = [
    {
      id: "purchase-1",
      number: "BC2023-015",
      date: "2023-05-02",
      supplierId: "supplier-1",
      supplierName: "HP Maroc",
      items: [
        {
          id: "pitem-1",
          productId: "product-1",
          productName: "Ordinateur portable HP",
          quantity: 10,
          unitPrice: 10000,
          totalPrice: 100000,
        },
      ],
      totalAmount: 100000,
      status: "received",
    },
  ]

  // Generate users
  const users: User[] = [
    {
      id: "user-1",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      lastLogin: "2023-05-20T10:30:00",
      status: "active",
    },
  ]

  // In the generateMockData function, add expenses generation
  const expenses: Expense[] = [
    {
      id: "expense-1",
      number: "DEP-2023-001",
      date: "2023-05-05",
      category: "Fournitures",
      description: "Achat de fournitures de bureau",
      amount: 1200,
      taxRate: 20,
      taxAmount: 240,
      totalAmount: 1440,
      paymentMethod: "bank",
      reference: "VIR-20230505-001",
      supplier: "Papeterie Centrale",
      status: "paid",
      attachments: ["/documents/facture-papeterie.pdf"],
    },
  ]

  // In the generateMockData function, add taxes generation
  const taxes: Tax[] = [
    {
      id: "tax-1",
      name: "TVA Standard",
      rate: 20,
      isDefault: true,
    },
    {
      id: "tax-2",
      name: "TVA Réduite",
      rate: 10,
    },
    {
      id: "tax-3",
      name: "TVA Super Réduite",
      rate: 5.5,
    },
    {
      id: "tax-4",
      name: "Exonéré",
      rate: 0,
    },
  ]

  // For realistic financial values
  const totalRevenue = 320000 // HT
  const totalPayments = 280000 // TTC
  const totalExpenses = 50000 // TTC

  // Correct VAT calculation
  // VAT from payments (revenue including tax)
  const revenueHT = totalPayments / 1.2
  const vatFromRevenue = totalPayments - revenueHT

  // VAT from expenses
  const expensesHT = totalExpenses / 1.2
  const vatFromExpenses = totalExpenses - expensesHT

  // Final VAT to pay
  const vatToPay = Math.round(vatFromRevenue - vatFromExpenses)

  // Add expenses to the return object
  return {
    dashboardData: {
      totalRevenue,
      totalPayments,
      totalExpenses,
      vatToPay, // Correctly calculated VAT
      monthlyRevenue,
      topClients: clients,
    },
    clients,
    products,
    stockMovements,
    devis,
    invoices,
    payments,
    creditNotes,
    suppliers,
    purchaseOrders,
    users,
    expenses,
    taxes, // Add this line
  }
}

// Add expenses to the destructured export at the end
export const {
  dashboardData,
  clients,
  products,
  stockMovements,
  devis,
  invoices,
  payments,
  creditNotes,
  suppliers,
  purchaseOrders,
  users,
  expenses, // Add this line
  taxes, // Add this line
} = generateMockData()

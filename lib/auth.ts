// Mock authentication functions for local storage

// Types
interface User {
  id: string
  fullName: string
  email: string
  role: "Admin" | "Editor" | "Viewer"
  companyId: string
}

interface Company {
  id: string
  name: string
  ice?: string
  rc?: string
  address?: string
  phone?: string
  website?: string
  logo?: string
}

// Mock users for testing
const mockUsers = [
  {
    id: "user-1",
    fullName: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "Admin",
    companyId: "company-1",
  },
  {
    id: "user-2",
    fullName: "Editor User",
    email: "editor@example.com",
    password: "password123",
    role: "Editor",
    companyId: "company-1",
  },
  {
    id: "user-3",
    fullName: "Viewer User",
    email: "viewer@example.com",
    password: "password123",
    role: "Viewer",
    companyId: "company-1",
  },
]

// Mock companies
const mockCompanies = [
  {
    id: "company-1",
    name: "Acme Inc",
    ice: "123456789",
    rc: "RC123456",
    address: "123 Main St, City",
    phone: "+1234567890",
    website: "https://acme.example.com",
  },
]

// Helper to generate IDs
const generateId = () => `id-${Math.random().toString(36).substring(2, 9)}`

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false

  const user = localStorage.getItem("user")
  return !!user
}

// Register a new user (admin only)
export const registerUser = async (
  fullName: string,
  email: string,
  password: string,
  companyName: string,
): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if email already exists
  const existingUser = mockUsers.find((user) => user.email === email)
  if (existingUser) {
    throw new Error("Email already in use")
  }

  // Create new company
  const companyId = generateId()
  const company: Company = {
    id: companyId,
    name: companyName,
  }

  // Create new user (admin role)
  const userId = generateId()
  const user: User & { password: string } = {
    id: userId,
    fullName,
    email,
    password,
    role: "Admin",
    companyId,
  }

  // Store in localStorage
  const { password: _, ...userWithoutPassword } = user
  localStorage.setItem("user", JSON.stringify(userWithoutPassword))
  localStorage.setItem("company", JSON.stringify(company))

  return userWithoutPassword
}

// Login user
export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find user by email and password
  const user = mockUsers.find((user) => user.email === email && user.password === password)

  if (!user) {
    throw new Error("Invalid email or password")
  }

  // Find company
  const company = mockCompanies.find((company) => company.id === user.companyId)

  // Store in localStorage
  const { password: _, ...userWithoutPassword } = user
  localStorage.setItem("user", JSON.stringify(userWithoutPassword))

  if (company) {
    localStorage.setItem("company", JSON.stringify(company))
  }

  return userWithoutPassword
}

// Logout user
export const logoutUser = (): void => {
  localStorage.removeItem("user")
}

export const updateCompanyProfile = async (formData: any): Promise<Company> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get existing company from localStorage
  const companyJson = localStorage.getItem("company")
  let company: Company = companyJson ? JSON.parse(companyJson) : { id: generateId(), name: "New Company" }

  // Update company with form data
  company = {
    ...company,
    ...formData,
  }

  // Store updated company in localStorage
  localStorage.setItem("company", JSON.stringify(company))

  return company
}

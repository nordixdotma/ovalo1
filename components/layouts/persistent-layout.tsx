"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Users2,
  X,
  Store,
  Receipt,
  Box,
  Wallet,
  FolderOpen,
} from "lucide-react"

import { logoutUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

// Add the import for useLanguage and t
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

// Define the sidebar item interface
interface SidebarItem {
  title: string
  icon: React.ElementType
  path: string
  description: string
}

// Define the sidebar group interface
interface SidebarGroup {
  label: string
  items: SidebarItem[]
}

// Update the PersistentLayout function to use the language context
export function PersistentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userData, setUserData] = useState<{ fullName: string; role: string } | null>(null)
  const [companyName, setCompanyName] = useState("Company")
  const [currentPageTitle, setCurrentPageTitle] = useState("")
  const [animate, setAnimate] = useState(false)
  const { language } = useLanguage()

  // Update the dashboardItem to use translations
  const dashboardItem: SidebarItem = {
    title: t("sidebar", "dashboard", language),
    icon: Home,
    path: "/dashboard",
    description: "Vue d'ensemble des KPI, graphiques, Top 10 clients",
  }

  // Update the sidebarGroups to use translations
  const sidebarGroups: SidebarGroup[] = [
    {
      label: t("sidebar", "salesCrm", language),
      items: [
        {
          title: t("sidebar", "clients", language),
          icon: Users,
          path: "/clients",
          description: "CRM Lite: ajouter/modifier/supprimer; historique de facturation",
        },
        {
          title: t("sidebar", "products", language),
          icon: Package,
          path: "/products",
          description: "Catalogue de produits et gestion",
        },
        {
          title: t("sidebar", "stock", language),
          icon: Box,
          path: "/stock",
          description: "Inventaire et mouvements de stock",
        },
      ],
    },
    {
      label: t("sidebar", "documents", language),
      items: [
        {
          title: t("sidebar", "quotes", language),
          icon: FileText,
          path: "/devis",
          description: "Créer/modifier; assistant IA",
        },
        {
          title: t("sidebar", "invoices", language),
          icon: FileText,
          path: "/invoices",
          description: "Convertir devis; suivi des statuts",
        },
        {
          title: t("sidebar", "payments", language),
          icon: CreditCard,
          path: "/payments",
          description: "Enregistrer les paiements",
        },
        {
          title: t("sidebar", "creditNotes", language),
          icon: Receipt,
          path: "/avoirs",
          description: "Gestion des notes de crédit",
        },
      ],
    },
    {
      label: t("sidebar", "purchases", language),
      items: [
        {
          title: t("sidebar", "suppliers", language),
          icon: Store,
          path: "/suppliers",
          description: "Gestion des fournisseurs",
        },
        {
          title: t("sidebar", "purchaseOrders", language),
          icon: ShoppingCart,
          path: "/purchases",
          description: "Bons de commande et suivi",
        },
        {
          title: t("sidebar", "expenses", language),
          icon: Wallet,
          path: "/depenses",
          description: "Gestion des dépenses",
        },
      ],
    },
    {
      label: t("sidebar", "myOvalo", language),
      items: [
        {
          title: t("sidebar", "settings", language),
          icon: Settings,
          path: "/settings",
          description: "Infos entreprise, PDF, taxes, langue",
        },
        {
          title: t("sidebar", "teamManagement", language),
          icon: Users2,
          path: "/users",
          description: "Inviter membres; permissions basées sur les rôles",
        },
        {
          title: t("sidebar", "myFolder", language),
          icon: FolderOpen,
          path: "/mon-dossier",
          description: "Gestion de votre dossier personnel",
        },
      ],
    },
  ]

  useEffect(() => {
    // Get user data from localStorage
    const userJson = localStorage.getItem("user")
    if (userJson) {
      const user = JSON.parse(userJson)
      setUserData({
        fullName: user.fullName || "User",
        role: user.role || "Admin",
      })
    } else {
      // Redirect to login if no user data
      router.push("/login")
    }

    // Get company data from localStorage
    const companyJson = localStorage.getItem("company")
    if (companyJson) {
      const company = JSON.parse(companyJson)
      setCompanyName(company.name || "Company")
    }

    // Set current page title based on pathname
    // Check dashboard item first
    if (pathname === dashboardItem.path) {
      setCurrentPageTitle(dashboardItem.title)
    } else {
      // Check all groups
      for (const group of sidebarGroups) {
        const item = group.items.find((item) => item.path === pathname)
        if (item) {
          setCurrentPageTitle(item.title)
          break
        }
      }
    }
  }, [pathname, router, language])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileOpen(false)

    // Reset animation state when navigating
    setAnimate(false)

    // Trigger animation after a short delay
    const timer = setTimeout(() => {
      setAnimate(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  // Check if the current path is a dashboard path
  const isDashboardPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/stock") ||
    pathname.startsWith("/devis") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/avoirs") ||
    pathname.startsWith("/suppliers") ||
    pathname.startsWith("/purchases") ||
    pathname.startsWith("/depenses") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/mon-dossier")

  // If not a dashboard path, just render children
  if (!isDashboardPath) {
    return <>{children}</>
  }

  // Sidebar content component to avoid duplication
  const SidebarContent = ({ isMobileSidebar = false }: { isMobileSidebar?: boolean }) => (
    <>
      {/* Toggle button - only show on desktop sidebar */}
      {!isMobileSidebar && (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-center mb-3 h-11 py-2.5 text-white hover:bg-white hover:text-black border border-white/20",
            collapsed ? "px-2" : "px-3",
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-5.5 w-5.5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}

      {/* Dashboard item (standalone) */}
      <div className="space-y-1.5 mb-4">
        <Button
          variant={pathname === dashboardItem.path ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-11 py-2.5 text-base text-white hover:bg-white hover:text-black focus:shadow-md",
            collapsed && !isMobileSidebar ? "justify-center px-2" : "px-3",
            pathname === dashboardItem.path && "bg-white text-black",
          )}
          onClick={() => router.push(dashboardItem.path)}
        >
          <dashboardItem.icon className={cn("h-5.5 w-5.5", collapsed && !isMobileSidebar ? "" : "mr-2.5")} />
          {(!collapsed || isMobileSidebar) && <span>{dashboardItem.title}</span>}
          {collapsed && !isMobileSidebar && <span className="sr-only">{dashboardItem.title}</span>}
        </Button>
      </div>

      {/* Grouped items */}
      {sidebarGroups.map((group, groupIndex) => (
        <div key={group.label} className="mb-4">
          {/* Group label - hide when collapsed */}
          {(!collapsed || isMobileSidebar) && (
            <div className="px-3 mb-1">
              <p className="text-xs font-medium text-white/70">{group.label}</p>
            </div>
          )}

          {/* Group items */}
          <div className="space-y-1.5">
            {group.items.map((item) => (
              <Button
                key={item.path}
                variant={pathname === item.path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-11 py-2.5 text-base text-white hover:bg-white hover:text-black focus:shadow-md",
                  collapsed && !isMobileSidebar ? "justify-center px-2" : "px-3",
                  pathname === item.path && "bg-white text-black",
                )}
                onClick={() => router.push(item.path)}
              >
                <item.icon className={cn("h-5.5 w-5.5", collapsed && !isMobileSidebar ? "" : "mr-2.5")} />
                {(!collapsed || isMobileSidebar) && <span>{item.title}</span>}
                {collapsed && !isMobileSidebar && <span className="sr-only">{item.title}</span>}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </>
  )

  return (
    <div className="flex h-screen flex-col md:flex-row bg-[#9c2d40] overflow-hidden dashboard-layout max-h-screen">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col bg-[#9c2d40] text-white transition-all duration-300",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <div className="flex flex-col h-full pl-2 pt-2 pb-2">
          {/* Company name at top of sidebar - centered and moved down */}
          <div className={cn("flex justify-center items-center mb-6 mt-4", collapsed ? "px-2" : "px-3")}>
            <h2
              className={cn(
                "font-semibold transition-all duration-300 text-white text-center",
                collapsed ? "text-xs" : "text-xl",
              )}
            >
              {collapsed ? companyName.substring(0, 1) : companyName}
            </h2>
          </div>

          {/* Container for navigation and logout to keep them together */}
          <div className="min-h-0 flex flex-col overflow-x-hidden">
            {/* Sidebar content - with hidden scrollbar */}
            <div className="relative flex-1 overflow-hidden max-h-[calc(100vh-160px)]">
              <div className="overflow-y-auto overflow-x-hidden hide-scrollbar h-full pb-9">
                <SidebarContent />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#9c2d40] to-transparent pointer-events-none"></div>
            </div>

            {/* Logout button - with fixed margin */}
            <Button
              variant="secondary"
              className={cn(
                "justify-start h-11 py-2.5 text-base bg-white text-red-600 hover:bg-white hover:text-red-600 mt-6 focus:shadow-md",
                collapsed ? "justify-center px-2" : "px-3",
              )}
              onClick={handleLogout}
            >
              <LogOut className={cn("h-5.5 w-5.5", collapsed ? "" : "mr-2.5")} />
              {!collapsed && <span>{t("sidebar", "logout", language)}</span>}
              {collapsed && <span className="sr-only">Déconnexion</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Sheet component */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[80%] max-w-[300px] [&>button]:hidden bg-[#9c2d40] text-white pr-2">
          <div className="flex flex-col h-full pl-2 pt-2 pb-2">
            {/* Company name and close button */}
            <div className="flex items-center justify-between mb-6 mt-4 px-3">
              <h2 className="text-xl font-semibold text-white">{companyName}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="text-white hover:bg-white hover:text-black"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Container for navigation and logout to keep them together */}
            <div className="flex flex-col h-full overflow-x-hidden">
              {/* Mobile sidebar content - with flex-1 to push logout to bottom and hidden scrollbar */}
              <div className="relative flex-1 overflow-hidden max-h-[calc(100vh-120px)]">
                <div className="overflow-y-auto overflow-x-hidden hide-scrollbar h-full pb-10">
                  <SidebarContent isMobileSidebar={true} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#9c2d40] to-transparent pointer-events-none"></div>
              </div>

              {/* Logout button - at the bottom */}
              <Button
                variant="secondary"
                className="justify-start h-11 py-2.5 text-base px-3 bg-white text-red-600 hover:bg-white hover:text-red-600 mt-6"
                onClick={handleLogout}
              >
                <LogOut className="h-5.5 w-5.5 mr-2.5" />
                <span>{t("sidebar", "logout", language)}</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div
        className={`flex flex-1 flex-col overflow-hidden bg-background transition-all duration-700 ease-out md:rounded-lg md:m-4 md:mt-6 md:mb-4 ${
          animate ? "opacity-100 scale-100 transform-none" : "opacity-0 scale-75 transform origin-center"
        }`}
      >
        {/* Header - no rounded corners on mobile */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 md:px-8 pt-2 md:rounded-t-lg">
          <div className="flex items-center">
            {/* Mobile menu button - only visible on mobile */}
            <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <h1 className="text-lg md:text-xl font-bold truncate">{currentPageTitle}</h1>
          </div>
          {userData && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-left">
                <p className="font-medium truncate max-w-[120px] md:max-w-none">{userData.fullName}</p>
                <p className="text-xs text-muted-foreground">{userData.role}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {userData.fullName.charAt(0)}
              </div>
            </div>
          )}
        </header>

        {/* Main content with styled scrollbar */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 overscroll-none hide-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}

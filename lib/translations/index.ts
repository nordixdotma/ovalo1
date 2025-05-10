import { commonTranslations } from "./common"
import { settingsTranslations } from "./settings"
import { sidebarTranslations } from "./sidebar"
import { dashboardTranslations } from "./dashboard"
import { usersTranslations } from "./users"
import { myFolderTranslations } from "./myFolder"
import { suppliersTranslations } from "./suppliers"
import { purchasesTranslations } from "./purchases"
import { expensesTranslations } from "./expenses"
import { clientsTranslations } from "./clients"
import { productsTranslations } from "./products"
import { stockTranslations } from "./stock"
import { avoirsTranslations } from "./avoirs"
import { paymentsTranslations } from "./payments"
import { invoicesTranslations } from "./invoices"
import { devisTranslations } from "./devis"

export type Language = "fr" | "ar" | "en"

export const translations = {
  sidebar: sidebarTranslations,
  settings: settingsTranslations,
  common: commonTranslations,
  dashboard: dashboardTranslations,
  users: usersTranslations,
  myFolder: myFolderTranslations,
  suppliers: suppliersTranslations,
  purchases: purchasesTranslations,
  expenses: expensesTranslations,
  clients: clientsTranslations,
  products: productsTranslations,
  stock: stockTranslations,
  avoirs: avoirsTranslations,
  payments: paymentsTranslations,
  invoices: invoicesTranslations,
  devis: devisTranslations,
}

export function getTranslation(section: keyof typeof translations, key: string, language: Language): string {
  const sectionTranslations = translations[section]
  if (!sectionTranslations) {
    console.warn(`Translation section "${section}" not found`)
    return key
  }

  const languageTranslations = sectionTranslations[language] as Record<string, string>
  if (!languageTranslations) {
    console.warn(`Language "${language}" not found in section "${section}"`)
    return key
  }

  const translation = languageTranslations[key]
  if (!translation) {
    console.warn(`Translation key "${key}" not found in section "${section}" for language "${language}"`)
    return key
  }

  return translation
}

export function t(
  section: keyof typeof translations,
  key: string,
  language: Language,
  params?: Record<string, string | number>,
): string {
  let translation = getTranslation(section, key, language)

  // Replace parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      translation = translation.replace(`{${key}}`, String(value))
    })
  }

  return translation
}

export {
  commonTranslations,
  sidebarTranslations,
  settingsTranslations,
  dashboardTranslations,
  usersTranslations,
  myFolderTranslations,
  suppliersTranslations,
  purchasesTranslations,
  expensesTranslations,
  clientsTranslations,
  productsTranslations,
  stockTranslations,
  avoirsTranslations,
  paymentsTranslations,
  invoicesTranslations,
  devisTranslations,
}

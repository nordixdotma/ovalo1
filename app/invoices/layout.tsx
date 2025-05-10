import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { getLanguageFromHeaders } from "@/lib/utils"
import { t } from "@/lib/translations"

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers()
  const language = getLanguageFromHeaders(headersList) || "fr"

  return {
    title: `${t("invoices", "invoices", language)} | Ovalo`,
    description: t("invoices", "manage_invoices", language),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

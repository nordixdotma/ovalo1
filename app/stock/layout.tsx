import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stock | Ovalo",
  description: "Gérez votre inventaire et mouvements de stock",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

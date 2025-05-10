import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Produits | Ovalo",
  description: "Gérez votre catalogue de produits",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

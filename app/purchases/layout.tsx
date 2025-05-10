import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Achats | Ovalo",
  description: "Gérez vos bons de commande",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

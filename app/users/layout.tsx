import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gestion d'équipe | Ovalo",
  description: "Gérez les membres de votre équipe",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

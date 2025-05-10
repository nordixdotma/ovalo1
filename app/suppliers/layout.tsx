import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fournisseurs | Ovalo",
  description: "Gérez vos fournisseurs",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

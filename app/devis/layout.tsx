import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Devis | Ovalo",
  description: "Gérez vos devis",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tableau de bord | Ovalo",
  description: "Tableau de bord Ovalo",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

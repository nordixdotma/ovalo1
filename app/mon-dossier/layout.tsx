import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mon dossier | Ovalo",
  description: "Gérez votre dossier personnel",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

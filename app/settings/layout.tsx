import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Paramètres | Ovalo",
  description: "Gérez les paramètres de votre compte",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

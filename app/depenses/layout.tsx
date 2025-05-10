import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dépenses | Ovalo",
  description: "Gérez vos dépenses",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

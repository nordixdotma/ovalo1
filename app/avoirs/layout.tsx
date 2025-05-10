import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Avoirs | Ovalo",
  description: "Gérez vos notes de crédit",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

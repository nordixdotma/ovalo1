import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clients | Ovalo",
  description: "Gérez vos clients",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

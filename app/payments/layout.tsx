import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payments | Ovalo",
  description: "Manage your payments",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

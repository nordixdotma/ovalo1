"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { Loader } from "@/components/loader"
import { PersistentLayout } from "@/components/layouts/persistent-layout"

interface Props {
  children: React.ReactNode
}

export default function ClientLayout({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Check if we're on an auth page (login or register)
  const isAuthPage = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <Loader />
  }

  // If we're on an auth page, don't wrap with PersistentLayout
  if (isAuthPage) {
    return children
  }

  // Otherwise, wrap with PersistentLayout for dashboard pages
  return <PersistentLayout>{children}</PersistentLayout>
}

"use client"

import { useState, useMemo } from "react"

type SortDirection = "asc" | "desc" | null

export interface SortState {
  column: string | null
  direction: SortDirection
}

export function useSort<T>(data: T[], defaultSort?: { column: string; direction: SortDirection }) {
  const [sort, setSort] = useState<SortState>({
    column: defaultSort?.column || null,
    direction: defaultSort?.direction || null,
  })

  const toggleSort = (column: string) => {
    setSort((prev) => {
      // If clicking on a different column, sort ascending
      if (prev.column !== column) {
        return { column, direction: "asc" }
      }

      // If clicking on the same column, cycle through: asc -> desc -> null
      const nextDirection = prev.direction === "asc" ? "desc" : prev.direction === "desc" ? null : "asc"
      return { column: nextDirection ? column : null, direction: nextDirection }
    })
  }

  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) return data

    return [...data].sort((a, b) => {
      const aValue = a[sort.column as keyof T]
      const bValue = b[sort.column as keyof T]

      // Handle different types of values
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.direction === "asc"
          ? aValue.localeCompare(bValue, "fr", { sensitivity: "base" })
          : bValue.localeCompare(aValue, "fr", { sensitivity: "base" })
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sort.direction === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      // Default comparison for other types
      if (aValue < bValue) return sort.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sort.direction === "asc" ? 1 : -1
      return 0
    })
  }, [data, sort.column, sort.direction])

  return { sortedData, sort, toggleSort }
}

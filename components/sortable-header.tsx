"use client"

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"
import type { SortState } from "@/hooks/use-sort"
import { cn } from "@/lib/utils"

interface SortableHeaderProps {
  column: string
  label: string
  sort: SortState
  toggleSort: (column: string) => void
  className?: string
}

export function SortableHeader({ column, label, sort, toggleSort, className }: SortableHeaderProps) {
  const isSorted = sort.column === column
  const isAsc = isSorted && sort.direction === "asc"
  const isDesc = isSorted && sort.direction === "desc"

  return (
    <TableHead className={cn("cursor-pointer select-none", className)} onClick={() => toggleSort(column)}>
      <div className="flex items-center justify-between w-full">
        <span>{label}</span>
        {isSorted ? (
          isAsc ? (
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : isDesc ? (
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : null
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
        )}
      </div>
    </TableHead>
  )
}

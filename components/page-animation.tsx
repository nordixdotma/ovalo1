"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface PageAnimationProps {
  children: React.ReactNode
}

export function PageAnimation({ children }: PageAnimationProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimate(true)
    }, 100) // Small delay to ensure DOM is ready

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        animate ? "opacity-100 scale-100 transform-none" : "opacity-0 scale-75 transform origin-center"
      }`}
    >
      {children}
    </div>
  )
}

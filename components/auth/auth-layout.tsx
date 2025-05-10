"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

import { isAuthenticated } from "@/lib/auth"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")

      // Only redirect if we're not already trying to register
      if (pathname !== "/register") {
        // Redirect based on role
        if (userData.role === "Admin") {
          router.push("/dashboard")
        } else if (userData.role === "Editor") {
          router.push("/dashboard/editor")
        } else if (userData.role === "Viewer") {
          router.push("/dashboard/viewer")
        }
      }
    }

    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimate(true)
    }, 100) // Small delay to ensure DOM is ready

    return () => clearTimeout(timer)
  }, [router, pathname])

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Column - Background Image with Overlay */}
      <div
        className={`relative hidden transform transition-transform duration-500 ease-out md:flex md:w-1/2 ${
          animate ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://plus.unsplash.com/premium_photo-1661353270751-3367badbb3e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          }}
        ></div>

        {/* Gradient Overlay (bottom to top) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>

        {/* Ovalo Logo in Top Left with Animation */}
        <div className="absolute top-8 left-8 z-10 logo-container">
          <div className="ball"></div>
          <h2 className="text-2xl font-bold text-white logo-text">Ovalo</h2>
        </div>

        {/* Content - Centered in the left column */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="max-w-md text-center px-6">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Simplifiez votre entreprise</h1>
            <p className="mt-4 text-lg text-white/80">Une plateforme. Contrôle complet.</p>
          </div>
        </div>

        {/* Logo and "by Ouz" text at bottom left */}
        <div className="absolute bottom-6 left-6 z-10 flex items-center">
          <img src="https://ouz.ma/static/media/logo.7aa72d30bde63acbc405.png" alt="Ouz Logo" className="h-8 w-auto" />
          <span className="ml-2 text-sm font-medium text-white">by Ouz</span>
        </div>
      </div>

      {/* Right Column - Form */}
      <div
        className={`flex flex-1 flex-col items-center justify-center p-6 transform transition-transform duration-500 ease-out md:w-1/2 overflow-y-auto ${
          animate ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-full max-w-md space-y-6 py-4">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      {/* Add the animation styles */}
      <style jsx>{`
        .logo-container {
          position: relative;
          width: 200px;
          height: 50px;
        }

        .ball {
          position: absolute;
          top: 0;
          left: 0;
          height: 40px;
          width: 40px;
          background-color: #9c2d40;
          border-radius: 50%;
          animation: ballmove 4s infinite alternate;
          z-index: 1;
          box-shadow: 0px 3px 15px rgba(0,0,0,0.3);
        }

        .logo-text {
          position: absolute;
          font-size: 2rem;
          display: inline-block;
          white-space: nowrap;
          font-weight: bold;
          overflow: hidden;
          top: 0;
          left: 0;
          color: white;
          animation: textreveal 4s infinite alternate;
        }

        @keyframes ballmove {
          0%{transform: translate(0px, 3px) scale(0.1);}
          10%{transform: translateX(0px) scale(0.5);}
          40%{transform: translateX(85px) scale(0.5);}
          60%{transform: translate(80px, 3px) scale(0.1);}
          70%{transform: translate(80px, 3px) scale(0.15);}
          80%{transform: translate(80px, 3px) scale(0.1);}
          90%{transform: translate(80px, 3px) scale(0.15);}
          100%{transform: translate(80px, 3px) scale(0.1);}
        }

        @keyframes textreveal {
          0% {width: 0;}
          10% {width: 0;}
          40% {width: 100px;}
          100% {width: 100px;}
        }
      `}</style>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"

import { users } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { usersTranslations } from "@/lib/translations"

// Update the component to use translations
export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (key: keyof typeof usersTranslations[typeof language], params?: Record<string, string | number>) => {
      const translation = usersTranslations[language][key]
      if (!params) return translation
      return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    status: "",
  })

  useEffect(() => {
    // Simulate API call to fetch user data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

        const user = users.find((u) => u.id === params.id)

        if (user) {
          setFormData({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
          })
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        // Handle error appropriately, maybe show a toast
        toast({
          title: "Error",
          description: "Failed to load user data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: t("userUpdated"),
        description: t("userUpdatedDescription", { name: formData.fullName }),
      })
      router.push("/users")
    }, 1000)
  }

  if (isLoading) {
    return (
      <PageAnimation>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          <Card className="border-[#9c2d40]/10 shadow-md">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageAnimation>
    )
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("editUser")}</h2>
            <p className="text-muted-foreground">{t("editUserDescription")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-[#9c2d40]/10 shadow-md">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <CardTitle className="text-[#9c2d40]">{t("userInfoEdit")}</CardTitle>
              <CardDescription>{t("userInfoEditDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {t("fullName")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t("fullName")}
                    required
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("email")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("email")}
                    required
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    {t("role")} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue placeholder={`${t("role")}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">{t("admin")}</SelectItem>
                      <SelectItem value="Editor">{t("editor")}</SelectItem>
                      <SelectItem value="Viewer">{t("viewer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {t("status")} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30">
                      <SelectValue placeholder={`${t("status")}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("active")}</SelectItem>
                      <SelectItem value="invited">{t("invited")}</SelectItem>
                      <SelectItem value="inactive">{t("inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-between py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-[#9c2d40]/20 hover:bg-[#9c2d40]/5 hover:text-[#9c2d40]"
              >
                <X className="mr-2 h-4 w-4" />
                {t("cancel")}
              </Button>
              <Button type="submit" className="bg-[#9c2d40] hover:bg-[#9c2d40]/90" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageAnimation>
  )
}

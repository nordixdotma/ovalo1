"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageAnimation } from "@/components/page-animation"
import { useToast } from "@/components/ui/use-toast"

// Add imports for translations
import { useLanguage } from "@/lib/contexts/language-context"
import { usersTranslations } from "@/lib/translations"

// Update the component to use translations
export default function AddUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = usersTranslations[language][key as keyof typeof usersTranslations[typeof language]]
    if (!params) return translation
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, String(value)), translation)
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Viewer",
    department: "",
    position: "",
    phone: "",
  })

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
        title: t("invitationSent"),
        description: t("invitationSentDescription", { email: formData.email }),
      })
      router.push("/users")
    }, 1000)
  }

  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("addUser")}</h2>
            <p className="text-muted-foreground">{t("addUserDescription")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-[#9c2d40]/10 shadow-md">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <CardTitle className="text-[#9c2d40]">{t("userInfo")}</CardTitle>
              <CardDescription>{t("userInfoDescription")}</CardDescription>
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
                  <Label htmlFor="department">{t("department")}</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder={t("departmentPlaceholder")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">{t("position")}</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder={t("positionPlaceholder")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("phonePlaceholder")}
                    className="border-[#9c2d40]/20 focus-visible:ring-[#9c2d40]/30"
                  />
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
                {isSubmitting ? t("sending") : t("sendInvitation")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageAnimation>
  )
}

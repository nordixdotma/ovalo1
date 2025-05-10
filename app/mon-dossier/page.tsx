"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/contexts/language-context"
import { t } from "@/lib/translations"

export default function MonDossierPage() {
  const { language } = useLanguage()

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("myFolder", "myFolder", language)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("myFolder", "underDevelopment", language)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

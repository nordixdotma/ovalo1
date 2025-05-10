import type { Metadata } from "next"
import Link from "next/link"

import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Inscription | Ovalo",
  description: "Créez votre compte administrateur et profil d'entreprise",
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Créez votre compte Ovalo"
      subtitle="Inscrivez-vous en tant qu'administrateur pour accéder à votre tableau de bord"
    >
      <RegisterForm />
      <div className="mt-4 text-center text-sm">
        Vous avez déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          Se connecter
        </Link>
      </div>
    </AuthLayout>
  )
}

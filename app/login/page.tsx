import type { Metadata } from "next"
import Link from "next/link"

import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Connexion | Ovalo",
  description: "Connectez-vous à votre compte Ovalo",
}

export default function LoginPage() {
  return (
    <AuthLayout title="Bienvenue sur Ovalo" subtitle="Connectez-vous à votre compte pour continuer">
      <LoginForm />
      <div className="mt-4 text-center text-sm">
        Vous n&apos;avez pas de compte ?{" "}
        <Link href="/register" className="font-medium text-primary underline underline-offset-4">
          S&apos;inscrire
        </Link>
      </div>
    </AuthLayout>
  )
}

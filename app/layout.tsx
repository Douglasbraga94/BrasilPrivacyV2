import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import ClientLayout, { KeycloakProvider } from "@/components/ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrasilPrivacy - Sistema de Gerenciamento de Proteção de Dados",
  description: "Sistema completo para gerenciamento e conformidade com a LGPD",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <KeycloakProvider>
          <ClientLayout>{children}</ClientLayout>
        </KeycloakProvider>
        <Toaster />
      </body>
    </html>
  )
}

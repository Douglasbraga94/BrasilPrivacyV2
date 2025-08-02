"use client"
import SessionProviderWrapper from "@/components/SessionProviderWrapper"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { usePathname } from "next/navigation"
import { signIn } from "next-auth/react"
import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import Keycloak from "keycloak-js"

let keycloakSingleton: Keycloak.KeycloakInstance | null = null

interface KeycloakContextType {
  authenticated: boolean
  token: string | null
  keycloak: Keycloak.KeycloakInstance | null
}

export const KeycloakContext = createContext<KeycloakContextType>({
  authenticated: false,
  token: null,
  keycloak: null,
})

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [keycloak, setKeycloak] = useState<Keycloak.KeycloakInstance | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const keycloakInitialized = useRef(false)

  useEffect(() => {
    if (keycloakInitialized.current) return
    keycloakInitialized.current = true
    const url = process.env.NEXT_PUBLIC_KEYCLOAK_URL || ""
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || ""
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || ""
    if (!url || !realm || !clientId) {
      setAuthenticated(false)
      return
    }
    if (!keycloakSingleton) {
      keycloakSingleton = new Keycloak({ url, realm, clientId })
    }
    keycloakSingleton.init({ onLoad: "login-required" }).then(auth => {
      setKeycloak(keycloakSingleton)
      setAuthenticated(auth)
      setToken(keycloakSingleton.token || null)
    })
    keycloakSingleton.onAuthSuccess = () => {
      setAuthenticated(true)
      setToken(keycloakSingleton!.token || null)
    }
    keycloakSingleton.onAuthLogout = () => {
      setAuthenticated(false)
      setToken(null)
    }
    keycloakSingleton.onTokenExpired = () => {
      keycloakSingleton!.updateToken(30).then(refreshed => {
        if (refreshed) setToken(keycloakSingleton!.token || null)
      })
    }
  }, [])

  return (
    <KeycloakContext.Provider value={{ authenticated, token, keycloak }}>
      {children}
    </KeycloakContext.Provider>
  )
}

export function useKeycloak() {
  return useContext(KeycloakContext)
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { authenticated, token } = useKeycloak()
  const pathname = usePathname()

  if (pathname.startsWith("/api/auth/error")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Ocorreu um erro de autenticação. Faça login novamente.</span>
      </div>
    )
  }

  // Não renderiza nada do sistema enquanto não autenticado
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <span className="text-lg text-gray-500">Redirecionando para login...</span>
      </div>
    )
  }

  // Renderiza layout visual do sistema para usuários autenticados
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}

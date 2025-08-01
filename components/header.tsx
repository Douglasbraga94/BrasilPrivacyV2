"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useKeycloak } from "@/components/ClientLayout"
import { useState } from "react"

export function Header() {
  const { keycloak } = useKeycloak()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Extrai informações do token Keycloak
  let nome = "-"
  let sobrenome = "-"
  let email = "-"
  if (keycloak && keycloak.tokenParsed) {
    nome = keycloak.tokenParsed.given_name || keycloak.tokenParsed.name || "-"
    sobrenome = keycloak.tokenParsed.family_name || "-"
    email = keycloak.tokenParsed.email || "-"
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (keycloak) {
                    keycloak.logout()
                  } else {
                    window.location.href = "/"
                  }
                }}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Perfil do Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Nome:</span> {nome}
                </div>
                <div>
                  <span className="font-semibold">Sobrenome:</span> {sobrenome}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {email}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}

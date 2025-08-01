"use client"
export const dynamic = "force-dynamic"

import { useKeycloak } from "@/components/ClientLayout"
import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, AlertTriangle } from "lucide-react"
import {
  showSuccess,
  showError,
  showValidationError,
  showLoading,
  confirmDeleteWithDetails,
  showDependencyError,
} from "@/lib/sweetalert"

interface DadoSensivel {
  id: string
  tipoDados: string
}

const validateDadoSensivel = (tipoDados: string) => {
  const errors: string[] = []

  if (!tipoDados || tipoDados.trim().length < 2) {
    errors.push("Tipo de dados deve ter pelo menos 2 caracteres")
  }

  if (tipoDados.length > 255) {
    errors.push("Tipo de dados deve ter no máximo 255 caracteres")
  }

  return { isValid: errors.length === 0, errors }
}

export default function DadosSensiveis() {
  const { authenticated, token } = useKeycloak()
  const [dados, setDados] = useState<DadoSensivel[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDado, setEditingDado] = useState<DadoSensivel | null>(null)
  const [formData, setFormData] = useState({ tipoDados: "" })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authenticated || !token) return
    const fetchDados = async () => {
      setIsLoaded(false)
      try {
        const res = await fetch("/api/dados-sensiveis", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setDados(Array.isArray(data) ? data : [])
        setTimeout(() => setIsLoaded(true), 100)
      } catch (error) {
        setDados([])
        showError("Erro", "Não foi possível carregar os dados sensíveis.")
        setTimeout(() => setIsLoaded(true), 100)
      }
    }
    fetchDados()
  }, [authenticated, token])

  const filteredDados = dados.filter((dado) => dado.tipoDados.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateDadoSensivel(formData.tipoDados)
    if (!validation.isValid) {
      showValidationError(validation.errors)
      return
    }
    setIsLoading(true)
    showLoading(editingDado ? "Atualizando dado..." : "Criando dado...")
    try {
      if (editingDado) {
        // Atualizar dado sensível no backend
        await fetch(`/api/dados-sensiveis/${editingDado.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tipoDados: formData.tipoDados }),
        })
        showSuccess("Dado atualizado!", `O tipo "${formData.tipoDados}" foi atualizado com sucesso.`)
      } else {
        // Criar novo dado sensível no backend
        await fetch("/api/dados-sensiveis", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tipoDados: formData.tipoDados }),
        })
        showSuccess("Dado criado!", `O tipo "${formData.tipoDados}" foi criado com sucesso.`)
      }
      // Atualizar lista após operação
      const res = await fetch("/api/dados-sensiveis", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setDados(Array.isArray(data) ? data : [])
      setFormData({ tipoDados: "" })
      setEditingDado(null)
      setIsDialogOpen(false)
    } catch (error) {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (dado: DadoSensivel) => {
    setEditingDado(dado)
    setFormData({ tipoDados: dado.tipoDados })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!editingDado) return
    const dependencies: string[] = []
    if (editingDado.tipoDados === "Dados referentes à saúde") {
      dependencies.push("3 processo(s) de negócio")
      dependencies.push("2 mapeamento(s) de dados")
    }
    if (dependencies.length > 0) {
      setIsDialogOpen(false)
      setTimeout(async () => {
        await showDependencyError(editingDado.tipoDados, dependencies)
        setIsDialogOpen(true)
      }, 100)
      return
    }
    const details = [`Código: DPS-${editingDado.id}`, `Tipo: ${editingDado.tipoDados}`]
    setIsDialogOpen(false)
    setTimeout(async () => {
      const result = await confirmDeleteWithDetails(editingDado.tipoDados, "tipo de dado sensível", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo dado...")
        try {
          // Excluir dado sensível no backend
          await fetch(`/api/dados-sensiveis/${editingDado.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          // Atualizar lista após exclusão
          const res = await fetch("/api/dados-sensiveis", { headers: { Authorization: `Bearer ${token}` } })
          const data = await res.json()
          setDados(Array.isArray(data) ? data : [])
          showSuccess("Dado excluído!", `O tipo \"${editingDado.tipoDados}\" foi excluído com sucesso.`)
        } catch (error) {
          showError("Erro ao excluir", "Ocorreu um erro inesperado. Tente novamente.")
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsDialogOpen(true)
      }
    }, 100)
  }

  const handleNewDado = () => {
    setEditingDado(null)
    setFormData({ tipoDados: "" })
    setIsDialogOpen(true)
  }

  const handleCardClick = (dado: DadoSensivel) => {
    setEditingDado(dado)
    setFormData({ tipoDados: dado.tipoDados })
    setIsDialogOpen(true)
  }

  if (!authenticated) return <div>Redirecionando para login...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categoria dos Dados Pessoais Sensíveis</h1>
          <p className="text-muted-foreground">
            Gerencie dados sensíveis que requerem proteção especial conforme a LGPD
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewDado} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Dado Sensível
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDado ? "Editar Dado Pessoal Sensível" : "Novo Dado Pessoal Sensível"}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-orange-800">
                Dados sensíveis requerem base legal específica e medidas de segurança reforçadas
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tipoDados">Tipo de Dados Sensíveis</Label>
                <Input
                  id="tipoDados"
                  value={formData.tipoDados}
                  onChange={(e) => setFormData({ tipoDados: e.target.value })}
                  placeholder="Ex: Dados referentes à saúde, Origem racial..."
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Especifique o tipo de dado sensível conforme Art. 5º, II da LGPD
                </p>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  {editingDado && (
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                      {isLoading ? "Excluindo..." : "Excluir"}
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : editingDado ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4 mb-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar dados sensíveis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredDados.length} dado sensível{filteredDados.length !== 1 ? "s" : ""} encontrado{filteredDados.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDados.map((dado, index) => (
          <Card
            key={dado.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
            onClick={() => handleCardClick(dado)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium text-gray-500">{`DPS-${dado.id}`}</CardTitle>
                  </div>
                </div>
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sensível
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{dado.tipoDados}</h3>
              <p className="text-sm text-gray-500">Dados que requerem proteção especial</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredDados.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado sensível encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando um novo tipo de dado sensível"}
          </p>
        </div>
      )}
    </div>
  )
}

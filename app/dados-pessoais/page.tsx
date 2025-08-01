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
import { Plus, Search, Eye } from "lucide-react"
import {
  showSuccess,
  showError,
  showValidationError,
  showLoading,
  confirmDeleteWithDetails,
  showDependencyError,
} from "@/lib/sweetalert"

interface DadoPessoal {
  id: string
  tipoDados: string
  codigo?: string // Adicionado para exibir o código no card
}

export default function DadosPessoais() {
  const { authenticated, token, keycloak } = useKeycloak()
  const [dados, setDados] = useState<DadoPessoal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDado, setEditingDado] = useState<DadoPessoal | null>(null)
  const [formData, setFormData] = useState({ tipoDados: "" })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Buscar dados reais do backend
  const fetchDados = async () => {
    setIsLoaded(false)
    try {
      const res = await fetch("/api/dados-pessoais", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      console.log("[DEBUG] Dados pessoais retornados:", data)
      setDados(Array.isArray(data) ? data.map((d: any) => ({ ...d, id: String(d.id), codigo: d.codigo })) : [])
      setTimeout(() => setIsLoaded(true), 100)
    } catch {
      console.log("Deu erro no setDados")
      setDados([])
      setTimeout(() => setIsLoaded(true), 100)
    }
  }

  useEffect(() => {
    if (authenticated && token) {
      fetchDados()
    }
  }, [authenticated, token])

  const filteredDados = dados.filter((dado) =>
    dado.tipoDados && typeof dado.tipoDados === "string"
      ? dado.tipoDados.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateDadoPessoal(formData.tipoDados)
    if (!validation.isValid) {
      showValidationError(validation.errors)
      return
    }

    setIsLoading(true)
    showLoading(editingDado ? "Atualizando dado..." : "Criando dado...")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      if (editingDado) {
        // Atualizar dado pessoal no backend
        await fetch(`/api/dados-pessoais/${editingDado.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tipoDados: formData.tipoDados }),
        })
        showSuccess("Dado atualizado!", `O tipo "${formData.tipoDados}" foi atualizado com sucesso.`)
      } else {
        // Criar novo dado pessoal no backend
        await fetch("/api/dados-pessoais", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tipoDados: formData.tipoDados }),
        })
        showSuccess("Dado criado!", `O tipo "${formData.tipoDados}" foi criado com sucesso.`)
      }
      // Atualizar lista após operação
      const res = await fetch("/api/dados-pessoais", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setDados(data.map((d: any) => ({ ...d, id: String(d.id) })))
      setFormData({ tipoDados: "" })
      setEditingDado(null)
      setIsDialogOpen(false)
    } catch (error) {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (dado: DadoPessoal) => {
    setEditingDado(dado)
    setFormData({ tipoDados: dado.tipoDados })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!editingDado) return

    const dependencies: string[] = []
    if (editingDado.tipoDados === "CPF" || editingDado.tipoDados === "Nome completo") {
      dependencies.push("10+ processo(s) de negócio")
      dependencies.push("5 mapeamento(s) de dados")
    }

    if (dependencies.length > 0) {
      setIsDialogOpen(false)
      setTimeout(async () => {
        await showDependencyError(editingDado.tipoDados, dependencies)
        setIsDialogOpen(true)
      }, 100)
      return
    }

    const details = [`Código: ${editingDado.id}`, `Tipo: ${editingDado.tipoDados}`]

    setIsDialogOpen(false)
    setTimeout(async () => {
      const result = await confirmDeleteWithDetails(editingDado.tipoDados, "tipo de dado pessoal", details)

      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo dado...")

        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          // Excluir dado pessoal no backend
          await fetch(`/api/dados-pessoais/${editingDado.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          // Atualizar lista após exclusão
          const res = await fetch("/api/dados-pessoais", {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          setDados(data.map((d: any) => ({ ...d, id: String(d.id) })))
          showSuccess("Dado excluído!", `O tipo "${editingDado.tipoDados}" foi excluído com sucesso.`)
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

  const handleCardClick = (dado: DadoPessoal) => {
    setEditingDado(dado)
    setFormData({ tipoDados: dado.tipoDados })
    setIsDialogOpen(true)
  }

  const validateDadoPessoal = (tipoDados: string) => {
    const errors: string[] = []

    if (!tipoDados || tipoDados.trim().length < 2) {
      errors.push("Tipo de dados deve ter pelo menos 2 caracteres")
    }

    if (tipoDados.length > 255) {
      errors.push("Tipo de dados deve ter no máximo 255 caracteres")
    }

    return { isValid: errors.length === 0, errors }
  }

  if (!authenticated) return <div>Redirecionando para login...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categoria dos Dados Pessoais</h1>
          <p className="text-muted-foreground">Gerencie quais dados pessoais estão sendo coletados e tratados</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewDado}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo de Dado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDado ? "Editar Tipo de Dado Pessoal" : "Novo Tipo de Dado Pessoal"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tipoDados">Tipo de Dados</Label>
                <Input
                  id="tipoDados"
                  value={formData.tipoDados}
                  onChange={(e) => setFormData({ tipoDados: e.target.value })}
                  placeholder="Ex: Nome completo, CPF, E-mail..."
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Especifique o tipo de dado pessoal que está sendo coletado/tratado
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium text-gray-500">{dado.codigo ? dado.codigo : `DDP-${dado.id}`}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{dado.tipoDados}</h3>
              <p className="text-sm text-gray-500">Clique para visualizar detalhes</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredDados.length === 0 && (
        <div className="text-center py-12">
          <Eye className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando um novo tipo de dado pessoal"}
          </p>
        </div>
      )}
    </div>
  )
}

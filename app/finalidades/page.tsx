"use client"
export const dynamic = "force-dynamic"

import { useKeycloak } from "@/components/ClientLayout"
import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Target, CheckCircle, AlertCircle } from "lucide-react"
import {
  showSuccess,
  showError,
  showValidationError,
  showLoading,
  confirmDeleteWithDetails,
  showDependencyError,
} from "@/lib/sweetalert"

interface Finalidade {
  id: number // banco usa number, exibimos como FIN-xx
  nome: string
  descricao: string
  categoria: "Execução de Contrato" | "Interesse Legítimo" | "Consentimento" | "Cumprimento Legal"
  status: "Ativa" | "Inativa"
  dataCriacao: string
  conformeLGPD: boolean
}

const validateFinalidade = (data: any) => {
  const errors: string[] = []

  if (!data.nome || data.nome.trim().length < 3) {
    errors.push("Nome deve ter pelo menos 3 caracteres")
  }

  // descrição não é obrigatória, não validar tamanho mínimo
  if (data.descricao && data.descricao.length > 1000) {
    errors.push("Descrição deve ter no máximo 1000 caracteres")
  }

  if (!data.categoria) {
    errors.push("Categoria é obrigatória")
  }

  return { isValid: errors.length === 0, errors }
}

export default function Finalidades() {
  const { authenticated, token, keycloak } = useKeycloak()

  const [finalidades, setFinalidades] = useState<Finalidade[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFinalidade, setSelectedFinalidade] = useState<Finalidade | null>(null)
  const [editingFinalidade, setEditingFinalidade] = useState<Finalidade | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "" as any,
    status: "Ativa" as "Ativa" | "Inativa",
    conformeLGPD: true,
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categorias, setCategorias] = useState<{ id: number; nome: string }[]>([])

  // Buscar dados reais do backend
  const fetchFinalidades = async () => {
    setIsLoaded(false)
    try {
      const res = await fetch("/api/finalidades", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setFinalidades(data)
      setTimeout(() => setIsLoaded(true), 100)
    } catch {
      setFinalidades([])
      setTimeout(() => setIsLoaded(true), 100)
    }
  }

  useEffect(() => {
    if (authenticated && token) {
      fetchFinalidades()
    }
  }, [authenticated, token])

  const filteredFinalidades = finalidades.filter(
    (finalidade) =>
      finalidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finalidade.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "Execução de Contrato":
        return "bg-blue-100 text-blue-800"
      case "Interesse Legítimo":
        return "bg-green-100 text-green-800"
      case "Consentimento":
        return "bg-purple-100 text-purple-800"
      case "Cumprimento Legal":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateFinalidade(formData)
    if (!validation.isValid) {
      showValidationError(validation.errors)
      return
    }

    setIsLoading(true)
    showLoading(editingFinalidade ? "Atualizando finalidade..." : "Criando finalidade...")

    try {
      if (editingFinalidade) {
        await fetch(`/api/finalidades/${editingFinalidade.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        showSuccess("Finalidade atualizada!", `A finalidade "${formData.nome}" foi atualizada com sucesso.`)
      } else {
        await fetch("/api/finalidades", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        showSuccess("Finalidade criada!", `A finalidade "${formData.nome}" foi criada com sucesso.`)
      }
      setFormData({ nome: "", descricao: "", categoria: "", status: "Ativa", conformeLGPD: true })
      setEditingFinalidade(null)
      setSelectedFinalidade(null)
      setIsDialogOpen(false)
      fetchFinalidades()
    } catch {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (finalidade: Finalidade) => {
    setSelectedFinalidade(finalidade)
    setEditingFinalidade(finalidade)
    setFormData({
      nome: finalidade.nome,
      descricao: finalidade.descricao,
      categoria: finalidade.categoria,
      status: finalidade.status,
      conformeLGPD: finalidade.conformeLGPD,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedFinalidade) return
    setIsDialogOpen(false)
    setTimeout(async () => {
      const details = [
        `Código: FIN-${String(selectedFinalidade.id).padStart(2, "0")}`,
        `Nome: ${selectedFinalidade.nome}`,
        `Categoria: ${selectedFinalidade.categoria}`,
      ]
      const result = await confirmDeleteWithDetails(selectedFinalidade.nome, "finalidade", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo finalidade...")
        try {
          await fetch(`/api/finalidades/${selectedFinalidade.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
          showSuccess("Finalidade excluída!", `A finalidade "${selectedFinalidade.nome}" foi excluída com sucesso.`)
          fetchFinalidades()
        } catch {
          showError("Erro ao excluir", "Ocorreu um erro inesperado. Tente novamente.")
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsDialogOpen(true)
      }
    }, 100)
  }

  const handleNewFinalidade = () => {
    setEditingFinalidade(null)
    setSelectedFinalidade(null)
    setFormData({ nome: "", descricao: "", categoria: "", status: "Ativa", conformeLGPD: true })
    setIsDialogOpen(true)
  }

  if (!authenticated) return <div>Redirecionando para login...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finalidades</h1>
          <p className="text-muted-foreground">Gerencie as finalidades do tratamento de dados</p>
        </div>

        <Button onClick={handleNewFinalidade} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Finalidade
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar finalidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredFinalidades.length} finalidade{filteredFinalidades.length !== 1 ? "s" : ""} encontrada
          {filteredFinalidades.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFinalidades.map((finalidade, index) => (
          <Card
            key={finalidade.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
            onClick={() => handleCardClick(finalidade)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-500">{`FIN-${String(finalidade.id).padStart(2, "0")}`}</CardTitle>
                    <div className="flex items-center space-x-1 mt-1">
                      {finalidade.conformeLGPD ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={finalidade.status === "Ativa" ? "default" : "secondary"}>
                        {finalidade.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{finalidade.nome}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{finalidade.descricao}</p>
              </div>

              <div className="space-y-2">
                <Badge className={getCategoryColor(finalidade.categoria)} variant="outline">
                  {finalidade.categoria}
                </Badge>
                <div className="text-xs text-gray-500">
                  Criada em {new Date(finalidade.dataCriacao).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFinalidades.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma finalidade encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando uma nova finalidade"}
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl z-[1200]">
          <DialogHeader>
            <DialogTitle>
              {selectedFinalidade ? `${selectedFinalidade.nome} (${selectedFinalidade.id})` : "Nova Finalidade"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Finalidade</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome da finalidade"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva detalhadamente a finalidade do tratamento"
                rows={4}
                required
                disabled={isLoading}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">Mínimo 10 caracteres, máximo 1000 caracteres</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria || undefined}
                  onValueChange={(value: string) => setFormData({ ...formData, categoria: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="z-[1300]">
                    {categorias.length === 0 ? (
                      <SelectItem value="sem-categoria" disabled>Nenhuma categoria cadastrada</SelectItem>
                    ) : (
                      categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Ativa" | "Inativa") => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[1300]">
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="conformeLGPD"
                checked={formData.conformeLGPD}
                onChange={(e) => setFormData({ ...formData, conformeLGPD: e.target.checked })}
                disabled={isLoading}
                className="rounded"
              />
              <Label htmlFor="conformeLGPD" className="text-sm">
                Esta finalidade está em conformidade com a LGPD
              </Label>
            </div>

            <div className="flex justify-between">
              <div className="space-x-2">
                {selectedFinalidade && (
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
                  {isLoading ? "Salvando..." : selectedFinalidade ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

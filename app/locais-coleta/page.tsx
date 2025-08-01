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
import { Plus, Search, MapPin, Building, Globe, Server } from "lucide-react"
import {
  showSuccess,
  showError,
  showValidationError,
  showLoading,
  confirmDeleteWithDetails,
  showDependencyError,
} from "@/lib/sweetalert"

interface LocalColeta {
  id: number // banco usa number, exibimos como LOC-xx
  nome: string
  tipo: "Físico" | "Digital" | "Híbrido"
  descricao: string
  endereco?: string
  responsavel: string
  status: "Ativo" | "Inativo"
  dataCriacao: string
}

const validateLocalColeta = (data: any) => {
  const errors: string[] = []

  if (!data.nome || data.nome.trim().length < 3) {
    errors.push("Nome deve ter pelo menos 3 caracteres")
  }

  if (!data.tipo) {
    errors.push("Tipo é obrigatório")
  }

  if (!data.responsavel || data.responsavel.trim().length < 2) {
    errors.push("Responsável deve ter pelo menos 2 caracteres")
  }

  if (data.descricao && data.descricao.length > 500) {
    errors.push("Descrição deve ter no máximo 500 caracteres")
  }

  return { isValid: errors.length === 0, errors }
}

export default function LocaisColeta() {
  const { authenticated, token, keycloak } = useKeycloak()
  const [locais, setLocais] = useState<LocalColeta[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLocal, setSelectedLocal] = useState<LocalColeta | null>(null)
  const [editingLocal, setEditingLocal] = useState<LocalColeta | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "" as any,
    descricao: "",
    endereco: "",
    responsavel: "",
    status: "Ativo" as "Ativo" | "Inativo",
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Buscar dados reais do backend
  const fetchLocais = async () => {
    setIsLoaded(false)
    try {
      const res = await fetch("/api/locais-coleta", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLocais(Array.isArray(data) ? data : [])
      setTimeout(() => setIsLoaded(true), 100)
    } catch {
      setLocais([])
      setTimeout(() => setIsLoaded(true), 100)
    }
  }

  useEffect(() => {
    if (authenticated && token) {
      fetchLocais()
    }
  }, [authenticated, token])

  if (!authenticated) return <div>Redirecionando para login...</div>

  const filteredLocais = locais.filter(
    (local) =>
      local.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      local.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "Físico":
        return <Building className="h-5 w-5 text-blue-600" />
      case "Digital":
        return <Globe className="h-5 w-5 text-green-600" />
      case "Híbrido":
        return <Server className="h-5 w-5 text-purple-600" />
      default:
        return <MapPin className="h-5 w-5 text-gray-600" />
    }
  }

  const getColorByType = (tipo: string) => {
    switch (tipo) {
      case "Físico":
        return "bg-blue-100"
      case "Digital":
        return "bg-green-100"
      case "Híbrido":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateLocalColeta(formData)
    if (!validation.isValid) {
      showValidationError(validation.errors)
      return
    }

    setIsLoading(true)
    showLoading(editingLocal ? "Atualizando local..." : "Criando local...")

    try {
      if (editingLocal) {
        await fetch(`/api/locais-coleta/${editingLocal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        showSuccess("Local atualizado!", `O local "${formData.nome}" foi atualizado com sucesso.`)
      } else {
        await fetch("/api/locais-coleta", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        showSuccess("Local criado!", `O local "${formData.nome}" foi criado com sucesso.`)
      }
      setFormData({ nome: "", tipo: "", descricao: "", endereco: "", responsavel: "", status: "Ativo" })
      setEditingLocal(null)
      setSelectedLocal(null)
      setIsDialogOpen(false)
      fetchLocais()
    } catch {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (local: LocalColeta) => {
    setSelectedLocal(local)
    setEditingLocal(local)
    setFormData({
      nome: local.nome,
      tipo: local.tipo,
      descricao: local.descricao,
      endereco: local.endereco || "",
      responsavel: local.responsavel,
      status: local.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedLocal) return
    setIsDialogOpen(false)
    setTimeout(async () => {
      const details = [
        `Código: LOC-${String(selectedLocal.id).padStart(2, "0")}`,
        `Nome: ${selectedLocal.nome}`,
        `Tipo: ${selectedLocal.tipo}`,
      ]
      const result = await confirmDeleteWithDetails(selectedLocal.nome, "local de coleta", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo local...")
        try {
          await fetch(`/api/locais-coleta/${selectedLocal.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
          showSuccess("Local excluído!", `O local "${selectedLocal.nome}" foi excluído com sucesso.`)
          fetchLocais()
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

  const handleNewLocal = () => {
    setEditingLocal(null)
    setSelectedLocal(null)
    setFormData({ nome: "", tipo: "", descricao: "", endereco: "", responsavel: "", status: "Ativo" })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locais de Coleta</h1>
          <p className="text-muted-foreground">Gerencie os locais onde os dados são coletados</p>
        </div>

        <Button onClick={handleNewLocal} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Local
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar locais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredLocais.length} local{filteredLocais.length !== 1 ? "is" : ""} encontrado
          {filteredLocais.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocais.map((local, index) => (
          <Card
            key={local.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
            onClick={() => handleCardClick(local)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${getColorByType(local.tipo)} rounded-lg`}>{getIconByType(local.tipo)}</div>
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-500">{`LOC-${String(local.id).padStart(2, "0")}`}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{local.tipo}</Badge>
                      <Badge variant={local.status === "Ativo" ? "default" : "secondary"}>{local.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{local.nome}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{local.descricao}</p>
              </div>

              <div className="space-y-2 text-sm">
                {local.endereco && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{local.endereco}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-medium">Responsável:</span>
                  <span>{local.responsavel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLocais.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum local encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando um novo local de coleta"}
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLocal ? `${selectedLocal.nome} (${selectedLocal.id})` : "Novo Local de Coleta"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Local</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do local"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "Físico" | "Digital" | "Híbrido") => setFormData({ ...formData, tipo: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Físico">Físico</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o local de coleta"
                rows={3}
                disabled={isLoading}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">Máximo 500 caracteres</p>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço (opcional)</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Endereço físico do local"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Ativo" | "Inativo") => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="space-x-2">
                {selectedLocal && (
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
                  {isLoading ? "Salvando..." : selectedLocal ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

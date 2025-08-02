"use client"
export const dynamic = "force-dynamic"

import Keycloak from "keycloak-js"
import { useSession, signIn } from "next-auth/react"
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, User, Mail, Calendar } from "lucide-react"
import { useKeycloak } from "@/components/ClientLayout"

import {
  showSuccess,
  showError,
  showValidationError,
  showLoading,
  confirmDeleteWithDetails,
  showDependencyError,
} from "@/lib/sweetalert"

interface ProcessoNegocio {
  id: number
  codigo: string
  nome: string
  descricao: string
  area_negocio_id: number
  responsavel: string
  email: string
  status: "Ativo" | "Inativo"
  created_at?: string
  updated_at?: string
}

const validateProcessoNegocio = (data: any) => {
  const errors: string[] = []

  if (!data.nome || data.nome.trim().length === 0) {
    errors.push("Nome do processo é obrigatório")
  } else if (data.nome.trim().length < 3) {
    errors.push("Nome do processo deve ter pelo menos 3 caracteres")
  }

  if (!data.areaNegocioId || data.areaNegocioId === 0) {
    errors.push("Área responsável é obrigatória")
  }

  if (!data.nomeResponsavel || data.nomeResponsavel.trim().length < 2) {
    errors.push("Nome do responsável deve ter pelo menos 2 caracteres")
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("E-mail deve ter um formato válido")
  }

  // descrição não é obrigatória, não validar tamanho mínimo

  return { isValid: errors.length === 0, errors }
}

export default function ProcessosNegocioPage() {
  const { authenticated, token } = useKeycloak()
  // Hooks SEMPRE no topo
  const [processos, setProcessos] = useState<ProcessoNegocio[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoNegocio | null>(null)
  const [editingProcesso, setEditingProcesso] = useState<ProcessoNegocio | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    areaNegocioId: 0,
    responsavel: "",
    nomeResponsavel: "",
    email: "",
    status: "Ativo" as "Ativo" | "Inativo",
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [areasNegocio, setAreasNegocio] = useState<{ id: number; nome: string }[]>([])

  // Buscar processos do banco ao carregar
  useEffect(() => {
    const fetchProcessos = async () => {
      setIsLoaded(false)
      try {
        const res = await fetch("/api/processos-negocio", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setProcessos(Array.isArray(data) ? data : [])
        setTimeout(() => setIsLoaded(true), 100)
      } catch (error) {
        setProcessos([])
        setTimeout(() => setIsLoaded(true), 100)
      }
    }
    if (authenticated && token) {
      fetchProcessos()
    }
  }, [authenticated, token])

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch("/api/areas-negocio", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        const data = await res.json()
        if (Array.isArray(data)) {
          setAreasNegocio(data.map((a: any) => ({ id: a.id, nome: a.nome })))
        } else {
          setAreasNegocio([])
        }
      } catch (error) {
        setAreasNegocio([])
      }
    }
    if (token) fetchAreas()
  }, [token])

  const getAreaNome = (id: number) => {
    const area = areasNegocio.find((a) => a.id === id)
    return area ? area.nome : ""
  }

  const filteredProcessos = processos.filter(
    (processo) =>
      processo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAreaNome(processo.area_negocio_id).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateProcessoNegocio(formData)
    if (!validation.isValid) {
      showValidationError(validation.errors)
      return
    }
    setIsLoading(true)
    showLoading(editingProcesso ? "Atualizando processo..." : "Criando processo...")
    try {
      let response, result
      if (editingProcesso) {
        response = await fetch(`/api/processos-negocio/${editingProcesso.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nome: formData.nome,
            descricao: formData.descricao,
            area_negocio_id: formData.areaNegocioId,
            responsavel: formData.nomeResponsavel,
            status: formData.status,
            email: formData.email,
          }),
        })
        result = await response.json()
        showSuccess("Processo atualizado!", `O processo \"${formData.nome}\" foi atualizado com sucesso.`)
      } else {
        response = await fetch("/api/processos-negocio", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nome: formData.nome,
            descricao: formData.descricao,
            area_negocio_id: formData.areaNegocioId,
            responsavel: formData.nomeResponsavel,
            status: formData.status,
            email: formData.email,
          }),
        })
        result = await response.json()
        showSuccess("Processo criado!", `O processo \"${formData.nome}\" foi criado com sucesso.`)
      }
      // Atualizar lista após operação
      const res = await fetch("/api/processos-negocio", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setProcessos(data)
      setFormData({
        nome: "",
        descricao: "",
        areaNegocioId: 0,
        responsavel: "",
        nomeResponsavel: "",
        email: "",
        status: "Ativo",
      })
      setEditingProcesso(null)
      setSelectedProcesso(null)
      setIsDialogOpen(false)
    } catch (error) {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (processo: ProcessoNegocio) => {
    setSelectedProcesso(processo)
    setEditingProcesso(processo)
    setFormData({
      nome: processo.nome,
      descricao: processo.descricao,
      areaNegocioId: processo.area_negocio_id,
      nomeResponsavel: processo.responsavel,
      email: processo.email || "",
      status: processo.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedProcesso) return
    const dependencies: string[] = []
    if (selectedProcesso.status === "Ativo") {
      dependencies.push("Processo está ativo no sistema")
    }
    if (selectedProcesso.id === 1) {
      dependencies.push("2 mapeamento(s) de dados relacionados")
    }
    if (dependencies.length > 0) {
      setIsDialogOpen(false)
      setTimeout(async () => {
        await showDependencyError(selectedProcesso.nome, dependencies)
        setIsDialogOpen(true)
      }, 100)
      return
    }
    const details = [
      `Código: ${selectedProcesso.id}`,
      `Área: ${getAreaNome(selectedProcesso.area_negocio_id)}`,
      `Responsável: ${selectedProcesso.responsavel}`,
      `Status: ${selectedProcesso.status}`,
    ]
    setIsDialogOpen(false)
    setTimeout(async () => {
      const result = await confirmDeleteWithDetails(selectedProcesso.nome, "processo de negócio", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo processo...")
        try {
          await fetch(`/api/processos-negocio/${selectedProcesso.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          // Atualizar lista após exclusão
          const res = await fetch("/api/processos-negocio", { headers: { Authorization: `Bearer ${token}` } })
          const data = await res.json()
          setProcessos(data)
          setSelectedProcesso(null)
          showSuccess("Processo excluído!", `O processo \"${selectedProcesso.nome}\" foi excluído com sucesso.`)
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

  const handleNewProcesso = () => {
    setEditingProcesso(null)
    setSelectedProcesso(null)
    setFormData({
      nome: "",
      descricao: "",
      areaNegocioId: 0,
      responsavel: "",
      nomeResponsavel: "",
      email: "",
      status: "Ativo",
    })
    setIsDialogOpen(true)
  }

  // Protege a página: só renderiza se autenticado
  if (!authenticated) return <div>Carregando autenticação...</div>

  return (
    <div className="p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Processos de Negócio</h1>
            <p className="text-muted-foreground">Gerencie os processos onde acontece o tratamento de dados</p>
          </div>
          <Button onClick={handleNewProcesso} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Processo
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar processos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredProcessos.length} processo{filteredProcessos.length !== 1 ? "s" : ""} encontrado{filteredProcessos.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProcessos.map((processo, index) => (
            <Card
              key={processo.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => handleCardClick(processo)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-500">{processo.codigo}</CardTitle>
                      <Badge variant={processo.status === "Ativo" ? "default" : "secondary"} className="mt-1">
                        {processo.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{processo.nome}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{processo.descricao}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{getAreaNome(processo.area_negocio_id)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{processo.responsavel}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{processo.updated_at ? new Date(processo.updated_at).toLocaleDateString("pt-BR") : ""}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProcesso ? `${selectedProcesso.nome} (${selectedProcesso.codigo})` : "Novo Processo de Negócio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Processo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do processo"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="areaNegocioId">Área Responsável</Label>
                  <Select
                    value={String(formData.areaNegocioId)}
                    onValueChange={(value) => setFormData({ ...formData, areaNegocioId: Number(value) })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areasNegocio.map((area) => (
                        <SelectItem key={area.id} value={String(area.id)}>
                          {area.nome}
                        </SelectItem>
                      ))}
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
                  placeholder="Descreva o processo de negócio"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                  <Input
                    id="nomeResponsavel"
                    value={formData.nomeResponsavel}
                    onChange={(e) => setFormData({ ...formData, nomeResponsavel: e.target.value })}
                    placeholder="Nome completo"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@empresa.com"
                    required
                    disabled={isLoading}
                  />
                </div>
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
              <div className="flex justify-between">
                <div className="space-x-2">
                  {selectedProcesso && (
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
                    {isLoading ? "Salvando..." : selectedProcesso ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

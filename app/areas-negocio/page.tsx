"use client"
export const dynamic = "force-dynamic"

import Keycloak from "keycloak-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Building2 } from "lucide-react"
import {
  showSuccess,
  showError,
  showValidationError,
  showLoading,
  confirmDeleteWithDetails,
  showDependencyError,
} from "@/lib/sweetalert"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useKeycloak } from "@/components/ClientLayout"

interface AreaNegocio {
  id: number // agora é number, igual ao banco
  codigo: string // identificador tipo ARN-01
  nome: string
  created_at?: string
  processos_relacionados?: number
}

interface ProcessoNegocio {
  id: string
  nome: string
  area_negocio_id: number
}

export default function AreasNegocioPage() {
  const { authenticated, token } = useKeycloak()
  // Hooks SEMPRE no topo
  const [areas, setAreas] = useState<AreaNegocio[]>([])
  const [processos, setProcessos] = useState<ProcessoNegocio[]>([])
  const [loadingProcessos, setLoadingProcessos] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<AreaNegocio | null>(null)
  const [editingArea, setEditingArea] = useState<AreaNegocio | null>(null)
  const [formData, setFormData] = useState({ nome: "" })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const keycloakInitialized = useRef(false)

  // Buscar áreas do banco
  useEffect(() => {
    const fetchAreas = async () => {
      setIsLoaded(false)
      try {
        const res = await fetch("/api/areas-negocio", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        const data = await res.json()
        if (Array.isArray(data)) {
          setAreas(data)
        } else {
          setAreas([])
        }
        setTimeout(() => setIsLoaded(true), 100)
      } catch (error) {
        setAreas([])
        showError("Erro", "Não foi possível carregar as áreas de negócio.")
        setTimeout(() => setIsLoaded(true), 100)
      }
    }
    if (token) fetchAreas()
  }, [token])

  // Carregar processos reais do sistema
  useEffect(() => {
    const loadProcessos = async () => {
      try {
        setLoadingProcessos(true)
        // Buscar processos reais do backend
        const res = await fetch("/api/processos-negocio", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        const data = await res.json()
        if (Array.isArray(data)) {
          setProcessos(data)
        } else {
          setProcessos([])
        }
      } catch (error) {
        showError("Erro", "Não foi possível carregar os processos cadastrados.")
      } finally {
        setLoadingProcessos(false)
      }
    }
    if (token) loadProcessos()
  }, [token])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Função para contar processos por área (usando dados reais)
  const getProcessosCount = (areaId: number) => {
    return processos.filter((processo) => processo.area_negocio_id === areaId).length
  }

  // Função para obter lista de processos por área (usando dados reais)
  const getProcessosByArea = (areaId: number) => {
    return processos.filter((processo) => processo.area_negocio_id === areaId)
  }

  const validateAreaNegocio = (nome: string) => {
    const errors: string[] = []

    if (!nome || nome.trim().length === 0) {
      errors.push("Nome é obrigatório")
    } else if (nome.trim().length < 2) {
      errors.push("Nome deve ter pelo menos 2 caracteres")
    } else if (nome.trim().length > 255) {
      errors.push("Nome deve ter no máximo 255 caracteres")
    }

    const invalidChars = /[<>{}[\]\\/]/
    if (invalidChars.test(nome)) {
      errors.push("Nome contém caracteres inválidos (<, >, {, }, [, ], \\, /)")
    }

    // Verificar se já existe uma área com o mesmo nome
    const nomeExists = areas.some(
      (area) => typeof area.nome === "string" && area.nome.toLowerCase() === nome.trim().toLowerCase() && area.id !== editingArea?.id,
    )
    if (nomeExists) {
      errors.push("Já existe uma área com este nome")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  const checkDependencies = (area: AreaNegocio) => {
    const dependencies: string[] = []
    const processosArea = getProcessosByArea(area.id)

    if (processosArea.length > 0) {
      dependencies.push(`${processosArea.length} processo(s) de negócio:`)
      processosArea.forEach((processo) => {
        dependencies.push(`• ${processo.nome} (${processo.id})`)
      })
    }

    // Simular outras dependências baseadas em dados reais
    if (area.nome === "Recursos Humanos" && processosArea.length > 0) {
      dependencies.push("2 mapeamento(s) de dados pessoais")
      dependencies.push("1 política de retenção de currículos")
    } else if (area.nome === "Marketing" && processosArea.length > 0) {
      dependencies.push("1 mapeamento de dados de leads")
    } else if (area.nome === "Tecnologia da Informação" && processosArea.length > 0) {
      dependencies.push("3 política(s) de segurança")
      dependencies.push("1 procedimento de backup")
    }

    return dependencies
  }

  const filteredAreas = areas.filter(
    (area) => typeof area.nome === "string" && area.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Protege a página: só renderiza se autenticado
  if (!authenticated) return <div>Carregando autenticação...</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateAreaNegocio(formData.nome)
    if (!validation.isValid) {
      showValidationError(validation.errors)
      return
    }
    setIsLoading(true)
    showLoading(editingArea ? "Atualizando área..." : "Criando área...")
    try {
      let response, result
      if (editingArea) {
        response = await fetch(`/api/areas-negocio/${editingArea.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nome: formData.nome.trim() }),
        })
        result = await response.json()
        showSuccess("Área atualizada!", `A área "${formData.nome}" foi atualizada com sucesso.`)
      } else {
        response = await fetch("/api/areas-negocio", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nome: formData.nome.trim() }),
        })
        result = await response.json()
        showSuccess("Área criada!", `A área "${formData.nome}" foi criada com sucesso.`)
      }
      // Atualizar lista após operação
      const res = await fetch("/api/areas-negocio", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setAreas(data)
      setFormData({ nome: "" })
      setEditingArea(null)
      setSelectedArea(null)
      setIsDialogOpen(false)
    } catch (error) {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (area: AreaNegocio) => {
    setSelectedArea(area)
    setEditingArea(area)
    setFormData({ nome: area.nome })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedArea) return
    const dependencies = checkDependencies(selectedArea)
    if (dependencies.length > 0) {
      setIsDialogOpen(false)
      setTimeout(async () => {
        await showDependencyError(selectedArea.nome, dependencies)
        setIsDialogOpen(true)
      }, 100)
      return
    }
    const details = [
      `Código: ${selectedArea.codigo}`,
      `Criada em: ${selectedArea.created_at || "Data não disponível"}`,
      `Processos relacionados: ${getProcessosCount(selectedArea.id)}`,
    ]
    setIsDialogOpen(false)
    setTimeout(async () => {
      const result = await confirmDeleteWithDetails(selectedArea.nome, "área de negócio", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo área...")
        try {
          await fetch(`/api/areas-negocio/${selectedArea.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          // Atualizar lista após exclusão
          const res = await fetch("/api/areas-negocio", { headers: { Authorization: `Bearer ${token}` } })
          const data = await res.json()
          setAreas(data)
          setSelectedArea(null)
          showSuccess("Área excluída!", `A área "${selectedArea.nome}" foi excluída com sucesso.`)
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

  const handleNewArea = () => {
    setEditingArea(null)
    setSelectedArea(null)
    setFormData({ nome: "" })
    setIsDialogOpen(true)
  }

  // Mostrar loading enquanto carrega os processos
  if (loadingProcessos) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Áreas de Negócio</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <div className="h-5 w-5 bg-gray-300 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Áreas de Negócio</h1>
          <p className="text-muted-foreground">Gerencie as áreas de negócio da empresa</p>
        </div>

        <Button onClick={handleNewArea} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Área
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar áreas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAreas.length} área{filteredAreas.length !== 1 ? "s" : ""} encontrada
          {filteredAreas.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAreas.map((area, index) => {
          const processosCount = getProcessosCount(area.id)
          return (
            <Card
              key={area.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
              onClick={() => handleCardClick(area)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium text-gray-500">{area.codigo}</CardTitle>
                    </div>
                  </div>
                  {processosCount > 0 && (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {processosCount} processo{processosCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{area.nome}</h3>
                <p className="text-sm text-gray-500">
                  {processosCount > 0
                    ? `${processosCount} processo${processosCount !== 1 ? "s" : ""} associado${processosCount !== 1 ? "s" : ""}`
                    : "Nenhum processo associado"}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma área encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando uma nova área de negócio"}
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedArea ? `${selectedArea.nome} (${selectedArea.id})` : "Nova Área de Negócio"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Área</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ nome: e.target.value })}
                placeholder="Digite o nome da área de negócio"
                required
                disabled={isLoading}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground mt-1">Mínimo 2 caracteres, máximo 255 caracteres</p>
            </div>

            {/* Mostrar processos associados quando editando */}
            {selectedArea && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Processos Associados:</h4>
                {getProcessosByArea(selectedArea.id).length > 0 ? (
                  <ul className="text-xs text-gray-600 space-y-1">
                    {getProcessosByArea(selectedArea.id).map((processo) => (
                      <li key={processo.id} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {processo.nome} ({processo.id})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">Nenhum processo associado</p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <div className="space-x-2">
                {selectedArea && (
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
                  {isLoading ? "Salvando..." : selectedArea ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

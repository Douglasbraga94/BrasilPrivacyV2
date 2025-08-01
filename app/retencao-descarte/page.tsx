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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { showDependencyError, confirmDeleteWithDetails, showLoading, showSuccess, showError } from "@/lib/sweetalert"

interface RetencaoDescarte {
  id: string
  periodo: string
  duracao: number
  disposicaoFinal: string
  procedimentoEliminacao: string
}

export default function RetencaoDescarte() {
  const { authenticated, token } = useKeycloak()
  if (!authenticated) return <div>Redirecionando para login...</div>

  const [retencoes, setRetencoes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingRetencao, setEditingRetencao] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    periodo: "",
    duracao: 0,
    disposicaoFinal: "",
    procedimentoEliminacao: "",
  })

  const periodos = ["Anos", "Meses", "Semanas", "Dias"]
  const disposicoes = [
    "Eliminação completa",
    "Anonimização",
    "Pseudonimização",
    "Arquivamento permanente",
    "Transferência para arquivo histórico",
  ]

  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRetencoes = async () => {
      setIsLoaded(false)
      try {
        const res = await fetch("/api/retencao-descarte", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (Array.isArray(data)) {
          setRetencoes(
            data.map((item: any) => ({
              id: item.id, // id numérico do banco
              codigo: item.codigo, // código para exibição
              periodo: item.periodo_retencao || item.periodo,
              duracao: parseInt((item.periodo_retencao || "").match(/\d+/)?.[0] || item.duracao || "0"),
              disposicaoFinal: item.metodo_descarte || item.disposicaoFinal,
              procedimentoEliminacao: item.descricao || item.procedimentoEliminacao,
              responsavel: item.responsavel || "",
            })),
          )
        } else {
          setRetencoes([])
        }
        setTimeout(() => setIsLoaded(true), 100)
      } catch (error) {
        setRetencoes([])
        showError("Erro", "Não foi possível carregar as políticas de retenção.")
        setTimeout(() => setIsLoaded(true), 100)
      }
    }
    if (authenticated && token) {
      fetchRetencoes()
    }
  }, [authenticated, token])

  const filteredRetencoes = retencoes.filter(
    (retencao) =>
      (retencao.disposicaoFinal || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (retencao.procedimentoEliminacao || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar período e duração
    if (!formData.periodo || formData.duracao <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um período e insira uma duração válida.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    showLoading(editingRetencao ? "Atualizando política..." : "Criando política...")
    try {
      const payload = {
        nome: `Política ${formData.periodo} ${formData.duracao}`,
        descricao: formData.procedimentoEliminacao,
        periodo_retencao: `${formData.duracao} ${formData.periodo}`,
        metodo_descarte: formData.disposicaoFinal,
        responsavel: "",
      }
      if (editingRetencao) {
        await fetch(`/api/retencao-descarte/${editingRetencao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        showSuccess("Política atualizada!", "A política de retenção foi atualizada com sucesso.")
      } else {
        await fetch("/api/retencao-descarte", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        showSuccess("Política criada!", "Nova política de retenção criada com sucesso.")
      }
      // Atualizar lista após operação
      const res = await fetch("/api/retencao-descarte", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setRetencoes(
        data.map((item: any) => ({
          id: item.id, // id numérico do banco
          codigo: item.codigo, // código para exibição
          periodo: item.periodo_retencao || item.periodo,
          duracao: parseInt((item.periodo_retencao || "").match(/\d+/)?.[0] || item.duracao || "0"),
          disposicaoFinal: item.metodo_descarte || item.disposicaoFinal,
          procedimentoEliminacao: item.descricao || item.procedimentoEliminacao,
          responsavel: item.responsavel || "",
        })),
      )
      setFormData({
        periodo: "",
        duracao: 0,
        disposicaoFinal: "",
        procedimentoEliminacao: "",
      })
      setEditingRetencao(null)
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error('[RetencaoDescarte] Erro ao salvar:', error)
      if (error instanceof Response) {
        error.text().then((text) => {
          console.error('[RetencaoDescarte] Erro detalhado:', text)
        })
      }
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (retencao: any) => {
    setEditingRetencao(retencao)
    setFormData({
      periodo: retencao.periodo || retencao.periodo_retencao?.replace(/\d+\s*/, "") || "",
      duracao: retencao.duracao || parseInt((retencao.periodo_retencao || "").match(/\d+/)?.[0] || "0"),
      disposicaoFinal: retencao.disposicaoFinal || retencao.metodo_descarte || "",
      procedimentoEliminacao: retencao.procedimentoEliminacao || retencao.descricao || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!editingRetencao) return

    const dependencies: string[] = []
    if (editingRetencao.id === "01") {
      dependencies.push("3 processo(s) de negócio")
      dependencies.push("2 mapeamento(s) de dados")
    }

    if (dependencies.length > 0) {
      setIsDialogOpen(false)
      setTimeout(async () => {
        await showDependencyError("Política de Retenção", dependencies)
        setIsDialogOpen(true)
      }, 100)
      return
    }

    const details = [
      `Código: PPR-${editingRetencao.id}`,
      `Período: ${formatDuracao(editingRetencao.periodo, editingRetencao.duracao)}`,
      `Disposição: ${editingRetencao.disposicaoFinal}`,
    ]

    setIsDialogOpen(false)
    setTimeout(async () => {
      const result = await confirmDeleteWithDetails("Política de Retenção", "política de retenção", details)

      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo política...")

        try {
          await fetch(`/api/retencao-descarte/${editingRetencao.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })

          // Atualizar lista após exclusão
          const res = await fetch("/api/retencao-descarte", { headers: { Authorization: `Bearer ${token}` } })
          const data = await res.json()
          setRetencoes(
            data.map((item: any) => ({
              id: item.id, // id numérico do banco
              codigo: item.codigo, // código para exibição
              periodo: item.periodo_retencao || item.periodo,
              duracao: parseInt((item.periodo_retencao || "").match(/\d+/)?.[0] || item.duracao || "0"),
              disposicaoFinal: item.metodo_descarte || item.disposicaoFinal,
              procedimentoEliminacao: item.descricao || item.procedimentoEliminacao,
              responsavel: item.responsavel || "",
            })),
          )
          showSuccess("Política excluída!", "A política de retenção foi excluída com sucesso.")
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

  const handleNewRetencao = () => {
    setEditingRetencao(null)
    setFormData({
      periodo: "",
      duracao: 0,
      disposicaoFinal: "",
      procedimentoEliminacao: "",
    })
    setIsDialogOpen(true)
  }

  const formatDuracao = (periodo: string, duracao: number) => {
    return `${duracao} ${periodo.toLowerCase()}`
  }

  const getPeriodoColor = (periodo: string) => {
    const colors: { [key: string]: string } = {
      Anos: "bg-red-100 text-red-800",
      Meses: "bg-orange-100 text-orange-800",
      Semanas: "bg-yellow-100 text-yellow-800",
      Dias: "bg-green-100 text-green-800",
    }
    return colors[periodo] || "bg-gray-100 text-gray-800"
  }

  const handleCardClick = (retencao: any) => {
    setEditingRetencao(retencao)
    setFormData({
      periodo: retencao.periodo || retencao.periodo_retencao?.replace(/\d+\s*/, "") || "",
      duracao: retencao.duracao || parseInt((retencao.periodo_retencao || "").match(/\d+/)?.[0] || "0"),
      disposicaoFinal: retencao.disposicaoFinal || retencao.metodo_descarte || "",
      procedimentoEliminacao: retencao.procedimentoEliminacao || retencao.descricao || "",
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prazo de Retenção e Descarte</h1>
          <p className="text-muted-foreground">
            Gerencie o tempo de guarda dos dados e procedimentos de eliminação (Art. 15 e 16 da LGPD)
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewRetencao}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Política de Retenção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRetencao ? "Editar Política de Retenção" : "Nova Política de Retenção"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodo">Período</Label>
                  <Select
                    value={formData.periodo}
                    onValueChange={(value) => setFormData({ ...formData, periodo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos.map((periodo) => (
                        <SelectItem key={periodo} value={periodo}>
                          {periodo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duracao">Duração</Label>
                  <Input
                    id="duracao"
                    type="number"
                    min="1"
                    value={formData.duracao || ""}
                    onChange={(e) => setFormData({ ...formData, duracao: Number.parseInt(e.target.value) || 0 })}
                    placeholder="Quantidade"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="disposicaoFinal">Disposição Final</Label>
                <Select
                  value={formData.disposicaoFinal}
                  onValueChange={(value) => setFormData({ ...formData, disposicaoFinal: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disposição final" />
                  </SelectTrigger>
                  <SelectContent>
                    {disposicoes.map((disposicao) => (
                      <SelectItem key={disposicao} value={disposicao}>
                        {disposicao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="procedimentoEliminacao">Procedimento de Eliminação</Label>
                <Textarea
                  id="procedimentoEliminacao"
                  value={formData.procedimentoEliminacao}
                  onChange={(e) => setFormData({ ...formData, procedimentoEliminacao: e.target.value })}
                  placeholder="Descreva de que forma será realizada a eliminação dos dados"
                  rows={3}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Detalhe o processo técnico e administrativo para eliminação segura dos dados
                </p>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  {editingRetencao && (
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
                    {isLoading ? "Salvando..." : editingRetencao ? "Atualizar" : "Criar"}
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
            placeholder="Buscar políticas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredRetencoes.length} política{filteredRetencoes.length !== 1 ? "s" : ""} encontrada{filteredRetencoes.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRetencoes.map((item, index) => (
          <Card
            key={item.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
            onClick={() => handleCardClick(item)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium text-gray-500">{`PPR-${item.id}`}</CardTitle>
                  </div>
                </div>
                <Badge className={getPeriodoColor(item.periodo)} variant="secondary">
                  {formatDuracao(item.periodo, item.duracao)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">Política de Retenção</h3>
                <p className="text-sm text-gray-600">Disposição: {item.disposicaoFinal}</p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Procedimento:</p>
                <p className="text-xs text-gray-600 line-clamp-3">{item.procedimentoEliminacao}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredRetencoes.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma política encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando uma nova política de retenção"}
          </p>
        </div>
      )}
    </div>
  )
}

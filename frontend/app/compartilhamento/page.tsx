"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Globe, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { showDependencyError, confirmDeleteWithDetails, showLoading, showSuccess, showError } from "@/lib/sweetalert"
import { useKeycloak } from "@/components/ClientLayout"

interface Compartilhamento {
  id: string
  tipoTransicao: "Dentro do país" | "Transferência internacional"
  nome: string
  responsavelEnvio: string
  operadorDestino: string
  finalidadeCompartilhamento: string
  procedimento: string
  paisDestino?: string
}

declare global {
  interface Window {
    Swal?: any
    closeSwal?: () => void
  }
}

export default function Compartilhamento() {
  const { authenticated, token } = useKeycloak()

  if (!process.env.NEXT_PUBLIC_KEYCLOAK_URL || !process.env.NEXT_PUBLIC_KEYCLOAK_REALM || !process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID) {
    return <div>Configuração do Keycloak ausente. Verifique as variáveis de ambiente.</div>
  }

  // Protege a página: só renderiza se autenticado
  if (!authenticated) return <div>Redirecionando para login...</div>

  const [compartilhamentos, setCompartilhamentos] = useState<Compartilhamento[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompartilhamento, setEditingCompartilhamento] = useState<Compartilhamento | null>(null)
  const [formData, setFormData] = useState({
    tipoTransicao: "Dentro do país" as "Dentro do país" | "Transferência internacional",
    nome: "",
    responsavelEnvio: "",
    operadorDestino: "",
    finalidadeCompartilhamento: "",
    procedimento: "",
    paisDestino: "",
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Buscar compartilhamentos reais do backend
    const fetchCompartilhamentos = async () => {
      setIsLoaded(false)
      try {
        const res = await fetch("/api/compartilhamento", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (Array.isArray(data)) {
          setCompartilhamentos(
            data.map((item: any) => ({
              id: item.id,
              tipoTransicao: item.tipoTransicao || item.tipo_transicao || "Dentro do país",
              nome: item.nome,
              responsavelEnvio: item.destinatario || item.responsavelEnvio,
              operadorDestino: item.base_legal || item.operadorDestino,
              finalidadeCompartilhamento: item.finalidade || item.finalidadeCompartilhamento,
              procedimento: item.descricao || item.procedimento,
              paisDestino: item.paisDestino || item.pais_destino || "",
            }))
          )
        } else {
          setCompartilhamentos([])
        }
        setTimeout(() => setIsLoaded(true), 100)
      } catch {
        setCompartilhamentos([])
        setTimeout(() => setIsLoaded(true), 100)
      }
    }
    if (authenticated && token) {
      fetchCompartilhamentos()
    }
  }, [authenticated, token])

  const filteredCompartilhamentos = compartilhamentos.filter(
    (comp) =>
      comp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.operadorDestino.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.nome ||
      !formData.responsavelEnvio ||
      !formData.operadorDestino ||
      !formData.finalidadeCompartilhamento ||
      !formData.procedimento
    ) {
      toast({ variant: "destructive", title: "Erro", description: "Todos os campos são obrigatórios." })
      return
    }
    if (formData.tipoTransicao === "Transferência internacional" && !formData.paisDestino) {
      toast({ variant: "destructive", title: "Erro", description: "O país de destino é obrigatório para transferências internacionais." })
      return
    }
    if (formData.tipoTransicao === "Transferência internacional") {
      toast({ title: "Atenção", description: "Transferências internacionais podem ter implicações legais adicionais." })
    }
    setIsLoading(true)
    showLoading(editingCompartilhamento ? "Atualizando compartilhamento..." : "Criando compartilhamento...")
    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.procedimento,
        destinatario: formData.responsavelEnvio,
        finalidade: formData.finalidadeCompartilhamento,
        base_legal: formData.operadorDestino,
        tipoTransicao: formData.tipoTransicao,
        paisDestino: formData.tipoTransicao === "Transferência internacional" ? formData.paisDestino : ""
      }
      if (editingCompartilhamento) {
        await fetch(`/api/compartilhamento/${editingCompartilhamento.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        showSuccess("Compartilhamento atualizado!", `O compartilhamento \"${formData.nome}\" foi atualizado com sucesso.`)
      } else {
        await fetch("/api/compartilhamento", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        showSuccess("Compartilhamento criado!", `O compartilhamento \"${formData.nome}\" foi criado com sucesso.`)
      }
      // Atualizar lista
      const res = await fetch("/api/compartilhamento", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setCompartilhamentos(
        Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id,
              tipoTransicao: item.tipoTransicao || item.tipo_transicao || "Dentro do país",
              nome: item.nome,
              responsavelEnvio: item.destinatario || item.responsavelEnvio,
              operadorDestino: item.base_legal || item.operadorDestino,
              finalidadeCompartilhamento: item.finalidade || item.finalidadeCompartilhamento,
              procedimento: item.descricao || item.procedimento,
              paisDestino: item.paisDestino || item.pais_destino || "",
            }))
          : []
      )
      setFormData({
        tipoTransicao: "Dentro do país",
        nome: "",
        responsavelEnvio: "",
        operadorDestino: "",
        finalidadeCompartilhamento: "",
        procedimento: "",
        paisDestino: "",
      })
      setEditingCompartilhamento(null)
      setIsDialogOpen(false)
    } catch {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (compartilhamento: Compartilhamento) => {
    setEditingCompartilhamento(compartilhamento)
    setFormData({
      tipoTransicao: compartilhamento.tipoTransicao,
      nome: compartilhamento.nome,
      responsavelEnvio: compartilhamento.responsavelEnvio,
      operadorDestino: compartilhamento.operadorDestino,
      finalidadeCompartilhamento: compartilhamento.finalidadeCompartilhamento,
      procedimento: compartilhamento.procedimento,
      paisDestino: compartilhamento.paisDestino || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!editingCompartilhamento) return
    const dependencies: any[] = []
    if (editingCompartilhamento.id === "CCT-01") {
      dependencies.push("2 processo(s) de negócio")
      dependencies.push("1 mapeamento de dados")
    }
    if (dependencies.length > 0) {
      setIsDialogOpen(false)
      setTimeout(async () => {
        await showDependencyError(editingCompartilhamento.nome, dependencies)
        setIsDialogOpen(true)
      }, 100)
      return
    }
    const details = [
      `Código: ${editingCompartilhamento.id}`,
      `Tipo: ${editingCompartilhamento.tipoTransicao}`,
      `Operador: ${editingCompartilhamento.operadorDestino}`,
      `País: ${editingCompartilhamento.paisDestino || "Brasil"}`,
    ]
    setIsDialogOpen(false)
    setTimeout(async () => {
      const result = await confirmDeleteWithDetails(editingCompartilhamento.nome, "compartilhamento", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo compartilhamento...")
        try {
          await fetch(`/api/compartilhamento/${editingCompartilhamento.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          // Atualizar lista
          const res = await fetch("/api/compartilhamento", { headers: { Authorization: `Bearer ${token}` } })
          const data = await res.json()
          setCompartilhamentos(
            Array.isArray(data)
              ? data.map((item: any) => ({
                  id: item.id,
                  tipoTransicao: item.tipoTransicao || item.tipo_transicao || "Dentro do país",
                  nome: item.nome,
                  responsavelEnvio: item.destinatario || item.responsavelEnvio,
                  operadorDestino: item.base_legal || item.operadorDestino,
                  finalidadeCompartilhamento: item.finalidade || item.finalidadeCompartilhamento,
                  procedimento: item.descricao || item.procedimento,
                  paisDestino: item.paisDestino || item.pais_destino || "",
                }))
              : []
          )
          showSuccess(
            "Compartilhamento excluído!",
            `O compartilhamento "${editingCompartilhamento.nome}" foi excluído com sucesso.`,
          )
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

  const handleNewCompartilhamento = () => {
    setEditingCompartilhamento(null)
    setFormData({
      tipoTransicao: "Dentro do país",
      nome: "",
      responsavelEnvio: "",
      operadorDestino: "",
      finalidadeCompartilhamento: "",
      procedimento: "",
      paisDestino: "",
    })
    setIsDialogOpen(true)
  }

  const handleCardClick = (compartilhamento: Compartilhamento) => {
    setEditingCompartilhamento(compartilhamento)
    setFormData({
      tipoTransicao: compartilhamento.tipoTransicao,
      nome: compartilhamento.nome,
      responsavelEnvio: compartilhamento.responsavelEnvio,
      operadorDestino: compartilhamento.operadorDestino,
      finalidadeCompartilhamento: compartilhamento.finalidadeCompartilhamento,
      procedimento: compartilhamento.procedimento,
      paisDestino: compartilhamento.paisDestino || "",
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compartilhamento com Terceiros</h1>
          <p className="text-muted-foreground">
            Gerencie com quem os dados são compartilhados (Art. 7º, V e Art. 26 da LGPD)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCompartilhamento}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Compartilhamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingCompartilhamento ? "Editar Compartilhamento" : "Novo Compartilhamento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoTransicao">Tipo de Transição</Label>
                  <Select
                    value={formData.tipoTransicao}
                    onValueChange={(value: "Dentro do país" | "Transferência internacional") =>
                      setFormData({ ...formData, tipoTransicao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dentro do país">Dentro do país</SelectItem>
                      <SelectItem value="Transferência internacional">Transferência internacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nome">Nome do Compartilhamento</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome identificador do compartilhamento"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavelEnvio">Responsável pelo Envio</Label>
                  <Input
                    id="responsavelEnvio"
                    value={formData.responsavelEnvio}
                    onChange={(e) => setFormData({ ...formData, responsavelEnvio: e.target.value })}
                    placeholder="Nome do responsável"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="operadorDestino">Operador de Destino</Label>
                  <Input
                    id="operadorDestino"
                    value={formData.operadorDestino}
                    onChange={(e) => setFormData({ ...formData, operadorDestino: e.target.value })}
                    placeholder="Nome da entidade que recebe os dados"
                    required
                  />
                </div>
              </div>
              {formData.tipoTransicao === "Transferência internacional" && (
                <div>
                  <Label htmlFor="paisDestino">País de Destino</Label>
                  <Input
                    id="paisDestino"
                    value={formData.paisDestino}
                    onChange={(e) => setFormData({ ...formData, paisDestino: e.target.value })}
                    placeholder="Nome do país de destino"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="finalidadeCompartilhamento">Finalidade do Compartilhamento</Label>
                <Textarea
                  id="finalidadeCompartilhamento"
                  value={formData.finalidadeCompartilhamento}
                  onChange={(e) => setFormData({ ...formData, finalidadeCompartilhamento: e.target.value })}
                  placeholder="Explique por que o compartilhamento está acontecendo"
                  rows={2}
                  required
                />
              </div>
              <div>
                <Label htmlFor="procedimento">Procedimento</Label>
                <Textarea
                  id="procedimento"
                  value={formData.procedimento}
                  onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                  placeholder="Descreva como o compartilhamento é realizado"
                  rows={2}
                  required
                />
              </div>
              <div className="flex justify-between">
                <div className="space-x-2">
                  {editingCompartilhamento && (
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
                    {isLoading ? "Salvando..." : editingCompartilhamento ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Input de busca padronizado com contador ao lado direito */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar compartilhamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredCompartilhamentos.length} compartilhamento{filteredCompartilhamentos.length !== 1 && "s"} encontrado{filteredCompartilhamentos.length !== 1 && "s"}
        </div>
      </div>
      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompartilhamentos.map((comp, index) => (
          <Card
            key={comp.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
            onClick={() => handleCardClick(comp)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Share2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium text-gray-500">{comp.id}</CardTitle>
                  </div>
                </div>
                <Badge variant={comp.tipoTransicao === "Transferência internacional" ? "destructive" : "default"}>
                  {comp.tipoTransicao === "Transferência internacional" && <Globe className="h-3 w-3 mr-1" />}
                  {comp.tipoTransicao === "Transferência internacional" ? "Internacional" : "Nacional"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{comp.nome}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{comp.finalidadeCompartilhamento}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Operador:</span>
                  <span className="text-gray-900 font-medium truncate ml-2">{comp.operadorDestino}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">País:</span>
                  <span className="text-gray-900">{comp.paisDestino || "Brasil"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Responsável:</span>
                  <span className="text-gray-900 truncate ml-2">{comp.responsavelEnvio}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCompartilhamentos.length === 0 && (
          <div className="text-center py-12">
            <Share2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum compartilhamento encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Tente ajustar sua busca" : "Comece criando um novo compartilhamento"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

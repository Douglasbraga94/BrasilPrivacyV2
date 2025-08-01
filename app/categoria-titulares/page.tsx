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
import { Plus, Search, Users } from "lucide-react"
import {
  showSuccess,
  showError,
  showValidationError,
  showLoading,
  confirmDeleteWithDetails,
  showDependencyError,
} from "@/lib/sweetalert"

interface CategoriaTitular {
  id: number // banco usa number, exibimos como TIT-xx
  tipoTitular: string
}

export default function CategoriaTitulares() {
  const { authenticated, token, keycloak } = useKeycloak()
  const [categorias, setCategorias] = useState<CategoriaTitular[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<CategoriaTitular | null>(null)
  const [formData, setFormData] = useState({ tipoTitular: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Buscar dados reais do backend
  const fetchCategorias = async () => {
    setIsLoaded(false)
    try {
      const res = await fetch("/api/categoria-titulares", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setCategorias(Array.isArray(data) ? data.map((c: any) => ({ id: c.id, tipoTitular: c.nome })) : [])
      setTimeout(() => setIsLoaded(true), 100)
    } catch {
      setCategorias([])
      setTimeout(() => setIsLoaded(true), 100)
    }
  }

  useEffect(() => {
    if (authenticated && token) {
      fetchCategorias()
    }
  }, [authenticated, token])

  if (!authenticated) return <div>Redirecionando para login...</div>

  const filteredCategorias = categorias.filter((categoria) =>
    (categoria.tipoTitular || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const validateCategoriaTitular = (tipoTitular: string) => {
    const errors: string[] = []
    if (!tipoTitular || tipoTitular.trim().length < 2) {
      errors.push("Tipo de titular deve ter pelo menos 2 caracteres")
    }
    if (tipoTitular.length > 255) {
      errors.push("Tipo de titular deve ter no máximo 255 caracteres")
    }
    return { isValid: errors.length === 0, errors }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateCategoriaTitular(formData.tipoTitular)
    if (!validation.isValid) {
      showValidationError(validation.errors)
      return
    }
    setIsLoading(true)
    try {
      // Mapeia para o formato esperado pelo backend
      const payload = {
        nome: formData.tipoTitular,
        descricao: "", // ajuste se quiser permitir descrição
        tipo: "Titular" // ou outro valor se desejar
      }
      if (editingCategoria) {
        await fetch(`/api/categoria-titulares/${editingCategoria.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tipoTitular: formData.tipoTitular }),
        })
        showSuccess("Categoria atualizada!", `A categoria "${formData.tipoTitular}" foi atualizada com sucesso.`)
        await fetchCategorias() // Aguarda atualização antes de fechar modal
      } else {
        await fetch("/api/categoria-titulares", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        showSuccess("Categoria criada!", `A categoria "${formData.tipoTitular}" foi criada com sucesso.`)
        await fetchCategorias()
      }
      setFormData({ tipoTitular: "" })
      setEditingCategoria(null)
      setIsDialogOpen(false)
    } catch {
      showError("Erro ao salvar", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (categoria: CategoriaTitular) => {
    setEditingCategoria(categoria)
    setFormData({ tipoTitular: categoria.tipoTitular })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!editingCategoria) return
    setIsDialogOpen(false)
    setTimeout(async () => {
      const details = [
        `Código: TIT-${String(editingCategoria.id).padStart(2, "0")}`,
        `Tipo: ${editingCategoria.tipoTitular}`,
      ]
      const result = await confirmDeleteWithDetails(editingCategoria.tipoTitular, "categoria de titular", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo categoria...")
        try {
          await fetch(`/api/categoria-titulares/${editingCategoria.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          showSuccess("Categoria excluída!", `A categoria "${editingCategoria.tipoTitular}" foi excluída com sucesso.`)
          fetchCategorias()
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

  const handleNewCategoria = () => {
    setEditingCategoria(null)
    setFormData({ tipoTitular: "" })
    setIsDialogOpen(true)
  }

  const handleCardClick = (categoria: CategoriaTitular) => handleEdit(categoria)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categoria dos Titulares</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de pessoas naturais a quem se referem os dados pessoais tratados
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCategoria}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategoria ? "Editar Categoria de Titular" : "Nova Categoria de Titular"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tipoTitular">Tipo de Titular</Label>
                <Input
                  id="tipoTitular"
                  value={formData.tipoTitular}
                  onChange={(e) => setFormData({ tipoTitular: e.target.value })}
                  placeholder="Ex: Clientes, Funcionários, Fornecedores..."
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Identifique quem são os titulares dos dados (pessoas naturais)
                </p>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  {editingCategoria && (
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
                    {isLoading ? "Salvando..." : editingCategoria ? "Atualizar" : "Criar"}
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
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCategorias.length} categoria{filteredCategorias.length !== 1 ? "s" : ""} encontrada{filteredCategorias.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategorias.map((categoria, index) => (
          <Card
            key={categoria.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
            onClick={() => handleCardClick(categoria)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {`TIT-${String(categoria.id).padStart(2, "0")}`}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{categoria.tipoTitular}</h3>
              <p className="text-sm text-gray-500">Clique para visualizar detalhes</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredCategorias.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma categoria encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando uma nova categoria de titular"}
          </p>
        </div>
      )}
    </div>
  )
}

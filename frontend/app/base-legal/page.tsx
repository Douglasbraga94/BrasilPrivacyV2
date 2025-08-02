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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { showDependencyError, confirmDeleteWithDetails, showLoading, showSuccess, showError } from "@/lib/sweetalert"

interface BaseLegal {
  id: number // banco usa number, mas exibimos como BSL-xx
  hipoteseTratamento: string
  outraLegislacao?: string
}

export default function BaseLegal() {
  const { authenticated, token } = useKeycloak()
  const [bases, setBases] = useState<BaseLegal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingBase, setEditingBase] = useState<BaseLegal | null>(null)
  const [formData, setFormData] = useState({
    hipoteseTratamento: "",
    outraLegislacao: "",
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  // Buscar dados reais do backend
  const fetchBases = async () => {
    setIsLoaded(false)
    try {
      const res = await fetch("/api/base-legal", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setBases(
        Array.isArray(data)
          ? data.map((b: any) => ({
              id: b.id,
              hipoteseTratamento: b.nome || b.hipoteseTratamento || "",
              outraLegislacao: b.descricao || b.outraLegislacao || "",
            }))
          : [],
      )
      setTimeout(() => setIsLoaded(true), 100)
    } catch {
      setBases([])
      setTimeout(() => setIsLoaded(true), 100)
    }
  }

  useEffect(() => {
    if (authenticated && token) {
      fetchBases()
    }
  }, [authenticated, token])

  const filteredBases = bases.filter(
    (base) =>
      base.hipoteseTratamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (base.outraLegislacao && base.outraLegislacao.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (editingBase) {
      showLoading("Atualizando base legal...")
    } else {
      showLoading("Criando base legal...")
    }
    try {
      const payload = {
        nome: formData.hipoteseTratamento,
        descricao: formData.outraLegislacao,
        artigo_lgpd: "N/A",
        tipo: "N/A"
      }
      if (editingBase) {
        await fetch(`/api/base-legal/${editingBase.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        showSuccess("Base Legal Atualizada", "A base legal foi atualizada com sucesso.")
        await fetchBases()
      } else {
        await fetch("/api/base-legal", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        showSuccess("Base Legal Criada", "Uma nova base legal foi criada com sucesso.")
      }
      setFormData({ hipoteseTratamento: "", outraLegislacao: "" })
      setEditingBase(null)
      setIsDialogOpen(false)
      await fetchBases()
    } catch {
      showError("Erro ao salvar base legal", "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (base: BaseLegal) => {
    setEditingBase(base)
    setFormData({
      hipoteseTratamento: base.hipoteseTratamento,
      outraLegislacao: base.outraLegislacao || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!editingBase) return
    setIsDialogOpen(false)
    setTimeout(async () => {
      const details = [
        `Código: BSL-${String(editingBase.id).padStart(2, "0")}`,
        `Hipótese: ${editingBase.hipoteseTratamento.substring(0, 50)}...`,
        `Legislação: ${editingBase.outraLegislacao || "Não informada"}`,
      ]
      const result = await confirmDeleteWithDetails(editingBase.hipoteseTratamento, "base legal", details)
      if (result.isConfirmed) {
        setIsLoading(true)
        showLoading("Excluindo base legal...")
        try {
          await fetch(`/api/base-legal/${editingBase.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          showSuccess("Base legal excluída!", "A base legal foi excluída com sucesso.")
          await fetchBases()
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

  const handleNewBase = () => {
    setEditingBase(null)
    setFormData({ hipoteseTratamento: "", outraLegislacao: "" })
    setIsDialogOpen(true)
  }

  const handleCardClick = (base: BaseLegal) => handleEdit(base)

  if (!authenticated) return <div>Redirecionando para login...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Base Legal</h1>
          <p className="text-muted-foreground">
            Gerencie as justificativas jurídicas para o tratamento de dados (Art. 7º e 11º da LGPD)
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBase}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Base Legal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl z-[1300]">
            <DialogHeader>
              <DialogTitle>{editingBase ? "Editar Base Legal" : "Nova Base Legal"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} onInvalid={e => {
              e.preventDefault();
              const target = e.target as HTMLFormElement;
              const firstInvalid = target.querySelector(':invalid');
              if (firstInvalid) {
                console.warn('[BaseLegal] Campo inválido:', firstInvalid);
              }
            }} className="space-y-4">
              <div>
                <Label htmlFor="hipoteseTratamento">Hipótese de Tratamento</Label>
                <Textarea
                  id="hipoteseTratamento"
                  value={formData.hipoteseTratamento}
                  onChange={(e) => setFormData({ ...formData, hipoteseTratamento: e.target.value })}
                  placeholder="Descreva a hipótese legal que justifica o tratamento dos dados"
                  rows={3}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Baseie-se no Art. 7º (dados pessoais) ou Art. 11º (dados sensíveis) da LGPD
                </p>
              </div>

              <div>
                <Label htmlFor="outraLegislacao">Outra Legislação Aplicável (Opcional)</Label>
                <Input
                  id="outraLegislacao"
                  value={formData.outraLegislacao}
                  onChange={(e) => setFormData({ ...formData, outraLegislacao: e.target.value })}
                  placeholder="Ex: Lei 12.527/2011, Código Civil, etc."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cite outras leis ou regulamentos que também fundamentam o tratamento
                </p>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  {editingBase && (
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                      {isLoading ? "Excluindo..." : "Excluir"}
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} onClick={() => {
                    console.log('[BaseLegal] Clique no botão Salvar/Atualizar', { formData, editingBase });
                  }}>
                    {isLoading ? "Salvando..." : editingBase ? "Atualizar" : "Criar"}
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
            placeholder="Buscar bases legais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredBases.length} base legal{filteredBases.length !== 1 ? "s" : ""} encontrada{filteredBases.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBases.map((base, index) => (
          <Card
            key={base.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-500 hover:border-blue-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
            onClick={() => handleCardClick(base)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {`BSL-${String(base.id).padStart(2, "0")}`}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Base Legal</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{base.hipoteseTratamento}</p>
              </div>
              {base.outraLegislacao && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Legislação:</p>
                  <p className="text-xs text-gray-600">{base.outraLegislacao}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredBases.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma base legal encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente ajustar sua busca" : "Comece criando uma nova base legal"}
          </p>
        </div>
      )}
    </div>
  )
}

import { type NextRequest, NextResponse } from "next/server"
import { updateProcessoNegocio, deleteProcessoNegocio } from "@/lib/services/processos-negocio"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const data = await request.json()

    const requiredFields = ["nome", "area_negocio_id", "responsavel"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} é obrigatório` }, { status: 400 })
      }
    }

    const processo = await updateProcessoNegocio(id, data)
    return NextResponse.json(processo)
  } catch (error) {
    console.error("Erro ao atualizar processo de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await deleteProcessoNegocio(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar processo de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

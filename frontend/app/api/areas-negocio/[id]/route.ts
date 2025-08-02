import { type NextRequest, NextResponse } from "next/server"
import { updateAreaNegocio, deleteAreaNegocio } from "@/lib/services/areas-negocio"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const { nome } = await request.json()

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const area = await updateAreaNegocio(id, nome)
    return NextResponse.json(area)
  } catch (error) {
    console.error("Erro ao atualizar área de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await deleteAreaNegocio(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar área de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

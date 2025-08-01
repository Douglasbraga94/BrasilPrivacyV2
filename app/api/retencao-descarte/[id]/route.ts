import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// PUT: Atualiza uma política de retenção e descarte
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nome, descricao, periodo_retencao, metodo_descarte, responsavel } = await request.json()
    if (!nome || nome.trim().length < 3) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }
    await sql`
      UPDATE retencao_descarte SET nome = ${nome}, descricao = ${descricao}, periodo_retencao = ${periodo_retencao}, metodo_descarte = ${metodo_descarte}, responsavel = ${responsavel} WHERE id = ${params.id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar política de retenção" }, { status: 500 })
  }
}

// DELETE: Remove uma política de retenção e descarte
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM retencao_descarte WHERE id = ${params.id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir política de retenção" }, { status: 500 })
  }
}

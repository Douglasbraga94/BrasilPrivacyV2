import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// PUT: Atualiza um dado sensível
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tipoDados } = await request.json()
    if (!tipoDados || tipoDados.trim().length < 2) {
      return NextResponse.json({ error: "Tipo de dado sensível inválido" }, { status: 400 })
    }
    await sql`
      UPDATE dados_sensiveis SET nome = ${tipoDados} WHERE id = ${params.id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar dado sensível" }, { status: 500 })
  }
}

// DELETE: Remove um dado sensível
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM dados_sensiveis WHERE id = ${params.id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir dado sensível" }, { status: 500 })
  }
}

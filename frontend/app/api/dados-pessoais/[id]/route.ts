import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// GET: Busca um dado pessoal por id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await sql`SELECT id, nome as "tipoDados" FROM dados_pessoais WHERE id = ${id}`
    if (result.length === 0) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar dado pessoal" }, { status: 500 })
  }
}

// PUT: Atualiza um dado pessoal
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { tipoDados } = await request.json()
    await sql`UPDATE dados_pessoais SET nome = ${tipoDados} WHERE id = ${id}`
    const result = await sql`SELECT id, nome as "tipoDados" FROM dados_pessoais WHERE id = ${id}`
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar dado pessoal" }, { status: 500 })
  }
}

// DELETE: Remove um dado pessoal
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await sql`DELETE FROM dados_pessoais WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir dado pessoal" }, { status: 500 })
  }
}

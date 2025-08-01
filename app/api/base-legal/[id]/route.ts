import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const result = await sql`
      UPDATE base_legal SET
        nome = ${data.nome},
        descricao = ${data.descricao},
        artigo_lgpd = ${data.artigo_lgpd},
        tipo = ${data.tipo},
        updated_at = NOW()
      WHERE id = ${Number(params.id)}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar base legal" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM base_legal WHERE id = ${Number(params.id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir base legal" }, { status: 500 })
  }
}

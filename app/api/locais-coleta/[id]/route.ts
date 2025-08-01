import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const result = await sql`
      UPDATE locais_coleta SET
        nome = ${data.nome},
        tipo = ${data.tipo},
        descricao = ${data.descricao},
        endereco = ${data.endereco},
        responsavel = ${data.responsavel},
        status = ${data.status},
        updated_at = NOW()
      WHERE id = ${Number(params.id)}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar local de coleta" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM locais_coleta WHERE id = ${Number(params.id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir local de coleta" }, { status: 500 })
  }
}

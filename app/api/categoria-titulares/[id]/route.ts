import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    // O frontend envia { tipoTitular }, mas o banco espera nome e tipo
    const nome = data.tipoTitular || ""
    // Se quiser manter o campo 'tipo' separado, ajuste aqui:
    // const tipo = data.tipo || "Titular"
    const result = await sql`
      UPDATE categoria_titulares
      SET nome = ${nome}, updated_at = NOW()
      WHERE id = ${Number(params.id)}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao atualizar categoria de titular:", error)
    return NextResponse.json({ error: "Erro ao atualizar categoria de titular", details: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM categoria_titulares WHERE id = ${Number(params.id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir categoria de titular" }, { status: 500 })
  }
}

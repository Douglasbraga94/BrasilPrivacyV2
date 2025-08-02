import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    // Garante valores válidos para status e conformeLGPD
    const status = data.status === "Ativa" || data.status === "Inativa" ? data.status : "Ativa"
    const conformeLGPD = typeof data.conformeLGPD === "boolean" ? data.conformeLGPD : true
    const result = await sql`
      UPDATE finalidades
      SET nome = ${data.nome}, descricao = ${data.descricao}, categoria = ${data.categoria}, status = ${status}, "conformeLGPD" = ${conformeLGPD}, updated_at = NOW()
      WHERE id = ${Number(params.id)}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar finalidade", details: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM finalidades WHERE id = ${Number(params.id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir finalidade" }, { status: 500 })
  }
}

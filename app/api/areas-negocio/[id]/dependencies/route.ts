import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Verificar dependências em processos de negócio
    const processos = await sql`
      SELECT id, nome FROM processos_negocio 
      WHERE area_responsavel = (
        SELECT nome FROM areas_negocio WHERE id = ${id}
      )
    `

    // Aqui você pode adicionar outras verificações de dependências
    // Por exemplo, verificar se a área está sendo usada em mapeamentos, etc.

    return NextResponse.json({
      processos: processos || [],
      outros: [], // Adicione outras dependências conforme necessário
    })
  } catch (error) {
    console.error("Erro ao verificar dependências:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

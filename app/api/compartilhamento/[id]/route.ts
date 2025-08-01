import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { validateKeycloakJWT } from "@/lib/utils/keycloak-jwt"

function getTokenFromRequest(request: NextRequest): string | undefined {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return undefined
  const parts = authHeader.split(" ")
  if (parts.length === 2 && parts[0] === "Bearer") return parts[1]
  return undefined
}

// Protege todas as rotas: GET, POST, PUT, DELETE
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  // Lógica para a rota GET
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  // Lógica para a rota POST
}

// PUT: Atualiza um compartilhamento
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { nome, descricao, destinatario, finalidade, base_legal, tipoTransicao, paisDestino } = await request.json()
    if (!nome || nome.trim().length < 3) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }
    const result = await sql`
      UPDATE compartilhamento SET nome = ${nome}, descricao = ${descricao}, destinatario = ${destinatario}, finalidade = ${finalidade}, base_legal = ${base_legal}, tipo_transicao = ${tipoTransicao}, pais_destino = ${paisDestino} WHERE id = ${params.id} RETURNING id, codigo, nome, descricao, destinatario, finalidade, base_legal, tipo_transicao, pais_destino
    `
    // Mapeia snake_case para camelCase
    const mapped = {
      id: result[0].id,
      codigo: result[0].codigo,
      nome: result[0].nome,
      descricao: result[0].descricao,
      destinatario: result[0].destinatario,
      finalidade: result[0].finalidade,
      base_legal: result[0].base_legal,
      tipoTransicao: result[0].tipo_transicao,
      paisDestino: result[0].pais_destino,
    }
    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar compartilhamento" }, { status: 500 })
  }
}

// DELETE: Remove um compartilhamento
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    await sql`DELETE FROM compartilhamento WHERE id = ${params.id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir compartilhamento" }, { status: 500 })
  }
}

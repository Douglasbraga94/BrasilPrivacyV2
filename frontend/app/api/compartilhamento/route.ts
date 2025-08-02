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

// GET: Lista todos os compartilhamentos
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const dados = await sql`SELECT id, codigo, nome, descricao, destinatario, finalidade, base_legal, tipo_transicao, pais_destino FROM compartilhamento ORDER BY id`
    // Mapeia snake_case para camelCase
    const mapped = dados.map((row: any) => ({
      id: row.id,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      destinatario: row.destinatario,
      finalidade: row.finalidade,
      base_legal: row.base_legal,
      tipoTransicao: row.tipo_transicao,
      paisDestino: row.pais_destino,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar compartilhamentos" }, { status: 500 })
  }
}

// POST: Cria um novo compartilhamento
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const reqBody = await request.json()
    const { nome, descricao, destinatario, finalidade, base_legal, tipoTransicao, paisDestino } = reqBody
    if (!nome || nome.trim().length < 3) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }
    // Gerar próximo código sequencial
    const last = await sql`SELECT codigo FROM compartilhamento ORDER BY id DESC LIMIT 1`
    let nextNumber = 1
    if (last.length > 0) {
      const lastCode = last[0].codigo as string
      const lastNumber = Number(lastCode?.split("-")[1])
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1
    }
    const codigo = `CCT-${String(nextNumber).padStart(2, "0")}`
    const result = await sql`
      INSERT INTO compartilhamento (codigo, nome, descricao, destinatario, finalidade, base_legal, tipo_transicao, pais_destino)
      VALUES (${codigo}, ${nome}, ${descricao}, ${destinatario}, ${finalidade}, ${base_legal}, ${tipoTransicao}, ${paisDestino}) RETURNING id, codigo, nome, descricao, destinatario, finalidade, base_legal, tipo_transicao, pais_destino
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
    return NextResponse.json({ error: "Erro ao criar compartilhamento" }, { status: 500 })
  }
}

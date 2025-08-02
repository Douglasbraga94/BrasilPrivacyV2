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

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const locais = await sql`SELECT * FROM locais_coleta ORDER BY id ASC`
    return NextResponse.json(locais)
  } catch (error) {
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    // Gerar código sequencial: LOC-XX
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM locais_coleta`
    const codigo = `LOC-${String(count + 1).padStart(2, "0")}`
    const result = await sql`
      INSERT INTO locais_coleta (codigo, nome, tipo, descricao, endereco, responsavel, status, created_at, updated_at)
      VALUES (${codigo}, ${data.nome}, ${data.tipo}, ${data.descricao}, ${data.endereco}, ${data.responsavel}, ${data.status}, NOW(), NOW())
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar local de coleta" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const result = await sql`
      UPDATE locais_coleta
      SET nome = ${data.nome}, tipo = ${data.tipo}, descricao = ${data.descricao}, endereco = ${data.endereco}, responsavel = ${data.responsavel}, status = ${data.status}, updated_at = NOW()
      WHERE codigo = ${data.codigo}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar local de coleta" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { codigo } = await request.json()
    await sql`DELETE FROM locais_coleta WHERE codigo = ${codigo}`
    return NextResponse.json({ message: "Local de coleta removido com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover local de coleta" }, { status: 500 })
  }
}

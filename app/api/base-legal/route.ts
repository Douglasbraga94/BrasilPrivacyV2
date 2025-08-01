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
    const baseLegal = await sql`SELECT * FROM base_legal ORDER BY id ASC`
    return NextResponse.json(baseLegal)
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
    // Gerar código sequencial: BSL-XX
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM base_legal`
    const codigo = `BSL-${String(count + 1).padStart(2, "0")}`
    const result = await sql`
      INSERT INTO base_legal (codigo, nome, descricao, artigo_lgpd, tipo, created_at, updated_at)
      VALUES (${codigo}, ${data.nome}, ${data.descricao}, ${data.artigo_lgpd}, ${data.tipo}, NOW(), NOW())
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar base legal" }, { status: 500 })
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
      UPDATE base_legal
      SET
        nome = ${data.nome},
        descricao = ${data.descricao},
        artigo_lgpd = ${data.artigo_lgpd},
        tipo = ${data.tipo},
        updated_at = NOW()
      WHERE codigo = ${data.codigo}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar base legal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    await sql`DELETE FROM base_legal WHERE codigo = ${data.codigo}`
    return NextResponse.json({ message: "Base legal removida com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover base legal" }, { status: 500 })
  }
}

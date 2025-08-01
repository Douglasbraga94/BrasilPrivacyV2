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
    const categorias = await sql`SELECT * FROM categoria_titulares ORDER BY id ASC`
    return NextResponse.json(categorias)
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
    // Gerar código sequencial: CCT-XX
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM categoria_titulares`
    const codigo = `CCT-${String(count + 1).padStart(2, "0")}`
    const result = await sql`
      INSERT INTO categoria_titulares (codigo, nome, descricao, tipo, created_at, updated_at)
      VALUES (${codigo}, ${data.nome}, ${data.descricao}, ${data.tipo}, NOW(), NOW())
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
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
      UPDATE categoria_titulares
      SET nome = ${data.nome}, descricao = ${data.descricao}, tipo = ${data.tipo}, updated_at = NOW()
      WHERE codigo = ${data.codigo}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 })
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
    await sql`DELETE FROM categoria_titulares WHERE codigo = ${codigo}`
    return NextResponse.json({ message: "Categoria deletada com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar categoria" }, { status: 500 })
  }
}

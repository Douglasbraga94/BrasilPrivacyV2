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
    const finalidades = await sql`SELECT * FROM finalidades ORDER BY id ASC`
    return NextResponse.json(finalidades)
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
    // Gerar código sequencial: FIN-XX
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM finalidades`
    const codigo = `FIN-${String(count + 1).padStart(2, "0")}`
    const result = await sql`
      INSERT INTO finalidades (codigo, nome, descricao, categoria, status, "conformeLGPD", created_at, updated_at)
      VALUES (${codigo}, ${data.nome}, ${data.descricao}, ${data.categoria}, ${data.status}, ${data.conformeLGPD}, NOW(), NOW())
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao criar finalidade:", error)
    return NextResponse.json({ error: "Erro ao criar finalidade", details: String(error) }, { status: 500 })
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
      UPDATE finalidades
      SET nome = ${data.nome}, descricao = ${data.descricao}, categoria = ${data.categoria}, status = ${data.status}, "conformeLGPD" = ${data.conformeLGPD}, updated_at = NOW()
      WHERE codigo = ${data.codigo}
      RETURNING *
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "Finalidade não encontrada" }, { status: 404 })
    }
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao atualizar finalidade:", error)
    return NextResponse.json({ error: "Erro ao atualizar finalidade", details: String(error) }, { status: 500 })
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
    const result = await sql`
      DELETE FROM finalidades
      WHERE codigo = ${codigo}
      RETURNING *
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "Finalidade não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ message: "Finalidade deletada com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar finalidade:", error)
    return NextResponse.json({ error: "Erro ao deletar finalidade", details: String(error) }, { status: 500 })
  }
}

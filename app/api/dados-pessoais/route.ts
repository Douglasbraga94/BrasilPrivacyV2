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

// GET: Lista todos os dados pessoais
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const dados = await sql`SELECT id, codigo, nome as "tipoDados" FROM dados_pessoais ORDER BY id`
    return NextResponse.json(dados)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar dados pessoais" }, { status: 500 })
  }
}

// POST: Cria um novo dado pessoal
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { tipoDados } = await request.json()
    if (!tipoDados || tipoDados.trim().length < 2) {
      return NextResponse.json({ error: "Tipo de dados inválido" }, { status: 400 })
    }
    // Gerar próximo código sequencial
    const last = await sql`SELECT codigo FROM dados_pessoais ORDER BY id DESC LIMIT 1`
    let nextNumber = 1
    if (last.length > 0) {
      const lastCode = last[0].codigo as string
      const lastNumber = Number(lastCode?.split("-")[1])
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1
    }
    const codigo = `DDP-${String(nextNumber).padStart(2, "0")}`
    const result = await sql`INSERT INTO dados_pessoais (codigo, nome) VALUES (${codigo}, ${tipoDados}) RETURNING id, codigo, nome as "tipoDados"`
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar dado pessoal" }, { status: 500 })
  }
}

// PUT: Atualiza um dado pessoal existente
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id, tipoDados } = await request.json()
    if (!id || !tipoDados || tipoDados.trim().length < 2) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }
    const result = await sql`UPDATE dados_pessoais SET nome = ${tipoDados} WHERE id = ${id} RETURNING id, codigo, nome as "tipoDados"`
    if (result.length === 0) {
      return NextResponse.json({ error: "Dado pessoal não encontrado" }, { status: 404 })
    }
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar dado pessoal" }, { status: 500 })
  }
}

// DELETE: Remove um dado pessoal
export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    const result = await sql`DELETE FROM dados_pessoais WHERE id = ${id} RETURNING id`
    if (result.length === 0) {
      return NextResponse.json({ error: "Dado pessoal não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ message: "Dado pessoal removido com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover dado pessoal" }, { status: 500 })
  }
}

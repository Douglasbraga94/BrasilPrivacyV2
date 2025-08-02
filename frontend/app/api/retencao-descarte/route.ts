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

// GET: Lista todas as políticas de retenção e descarte
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const dados = await sql`SELECT id, codigo, nome, descricao, periodo_retencao, metodo_descarte, responsavel FROM retencao_descarte ORDER BY id`
    // Mapeia snake_case para camelCase e extrai duracao
    const mapped = dados.map((row: any) => {
      // Extrai número da duração e período do campo periodo_retencao
      let duracao = 0
      let periodo = ""
      if (row.periodo_retencao) {
        const match = row.periodo_retencao.match(/(\d+)\s*(\w+)/)
        if (match) {
          duracao = parseInt(match[1])
          periodo = match[2]
        }
      }
      return {
        id: row.id,
        codigo: row.codigo,
        nome: row.nome,
        descricao: row.descricao,
        periodo,
        duracao,
        disposicaoFinal: row.metodo_descarte,
        procedimentoEliminacao: row.descricao,
        responsavel: row.responsavel,
      }
    })
    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar políticas de retenção" }, { status: 500 })
  }
}

// POST: Cria uma nova política de retenção e descarte
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { nome, descricao, periodo_retencao, metodo_descarte, responsavel } = await request.json()
    if (!nome || nome.trim().length < 3) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }
    // Gerar próximo código sequencial
    const last = await sql`SELECT codigo FROM retencao_descarte ORDER BY id DESC LIMIT 1`
    let nextNumber = 1
    if (last.length > 0) {
      const lastCode = last[0].codigo as string
      const lastNumber = Number(lastCode?.split("-")[1])
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1
    }
    const codigo = `PPR-${String(nextNumber).padStart(2, "0")}`
    const result = await sql`
      INSERT INTO retencao_descarte (codigo, nome, descricao, periodo_retencao, metodo_descarte, responsavel)
      VALUES (${codigo}, ${nome}, ${descricao}, ${periodo_retencao}, ${metodo_descarte}, ${responsavel}) RETURNING id, codigo, nome, descricao, periodo_retencao, metodo_descarte, responsavel
    `
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar política de retenção" }, { status: 500 })
  }
}

// PUT: Atualiza uma política de retenção e descarte
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id, nome, descricao, periodo_retencao, metodo_descarte, responsavel } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    const result = await sql`
      UPDATE retencao_descarte
      SET nome = ${nome}, descricao = ${descricao}, periodo_retencao = ${periodo_retencao}, metodo_descarte = ${metodo_descarte}, responsavel = ${responsavel}
      WHERE id = ${id} RETURNING id, codigo, nome, descricao, periodo_retencao, metodo_descarte, responsavel
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "Política de retenção não encontrada" }, { status: 404 })
    }
    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar política de retenção" }, { status: 500 })
  }
}

// DELETE: Remove uma política de retenção e descarte
export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    const result = await sql`DELETE FROM retencao_descarte WHERE id = ${id} RETURNING id`
    if (result.length === 0) {
      return NextResponse.json({ error: "Política de retenção não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ message: "Política de retenção removida com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover política de retenção" }, { status: 500 })
  }
}

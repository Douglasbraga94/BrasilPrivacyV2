import { type NextRequest, NextResponse } from "next/server"
import { getProcessosNegocio, createProcessoNegocio, searchProcessosNegocio } from "@/lib/services/processos-negocio"
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
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let processos
    if (search) {
      processos = await searchProcessosNegocio(search)
    } else {
      processos = await getProcessosNegocio()
    }

    return NextResponse.json(processos)
  } catch (error) {
    console.error("Erro ao buscar processos de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
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

    const requiredFields = ["nome", "area_negocio_id", "responsavel"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} é obrigatório` }, { status: 400 })
      }
    }

    const processo = await createProcessoNegocio(data)
    return NextResponse.json(processo, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar processo de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
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

    const requiredFields = ["id", "nome", "area_negocio_id", "responsavel"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} é obrigatório` }, { status: 400 })
      }
    }

    // Aqui você chamaria a função para atualizar o processo de negócio, passando os dados necessários
    // const processoAtualizado = await atualizarProcessoNegocio(data)

    return NextResponse.json({ message: "Processo de negócio atualizado com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar processo de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request)
  const { valid } = validateKeycloakJWT(token)
  if (!valid) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do processo de negócio é obrigatório" }, { status: 400 })
    }

    // Aqui você chamaria a função para deletar o processo de negócio, passando o ID necessário
    // await deletarProcessoNegocio(id)

    return NextResponse.json({ message: "Processo de negócio deletado com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao deletar processo de negócio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

import { sql, type ProcessoNegocio } from "@/lib/database"

export async function getProcessosNegocio(): Promise<ProcessoNegocio[]> {
  const result = await sql`
    SELECT * FROM processos_negocio 
    ORDER BY id ASC
  `
  return result as ProcessoNegocio[]
}

export async function createProcessoNegocio(data: {
  nome: string
  descricao?: string
  area_negocio_id: number
  responsavel: string
  status: "Ativo" | "Inativo"
  email?: string
}): Promise<ProcessoNegocio> {
  // Gerar próximo código
  const lastProcesso = await sql`
    SELECT codigo FROM processos_negocio 
    ORDER BY id DESC 
    LIMIT 1
  `

  let nextNumber = 1
  if (lastProcesso.length > 0) {
    const lastCode = lastProcesso[0].codigo as string
    const lastNumber = Number.parseInt(lastCode.replace(/\D/g, ""))
    nextNumber = lastNumber + 1
  }

  const codigo = `PRC-${String(nextNumber).padStart(2, "0")}`

  const result = await sql`
    INSERT INTO processos_negocio (codigo, nome, descricao, area_negocio_id, responsavel, status, email)
    VALUES (${codigo}, ${data.nome}, ${data.descricao || ""}, ${data.area_negocio_id}, ${data.responsavel}, ${data.status}, ${data.email || ""})
    RETURNING *
  `

  return result[0] as ProcessoNegocio
}

export async function updateProcessoNegocio(
  id: number,
  data: {
    nome: string
    descricao?: string | null
    area_negocio_id: number | null
    responsavel: string | null
    status: "Ativo" | "Inativo" | null
    email?: string | null
  },
): Promise<ProcessoNegocio> {
  // Garante que todos os campos tenham valor válido
  const nome = typeof data.nome === "string" ? data.nome : ""
  const descricao = typeof data.descricao === "string" ? data.descricao : ""
  const area_negocio_id = typeof data.area_negocio_id === "number" ? data.area_negocio_id : 0
  const responsavel = typeof data.responsavel === "string" ? data.responsavel : ""
  const status = data.status === "Ativo" || data.status === "Inativo" ? data.status : "Ativo"
  const email = typeof data.email === "string" ? data.email : ""

  const result = await sql`
    UPDATE processos_negocio 
    SET nome = ${nome}, 
        descricao = ${descricao}, 
        area_negocio_id = ${area_negocio_id}, 
        responsavel = ${responsavel},
        status = ${status},
        email = ${email}
    WHERE id = ${id}
    RETURNING *
  `

  return result[0] as ProcessoNegocio
}

export async function deleteProcessoNegocio(id: number): Promise<void> {
  await sql`
    DELETE FROM processos_negocio 
    WHERE id = ${id}
  `
}

export async function searchProcessosNegocio(searchTerm: string): Promise<ProcessoNegocio[]> {
  const result = await sql`
    SELECT * FROM processos_negocio 
    WHERE nome ILIKE ${`%${searchTerm}%`} 
       OR responsavel ILIKE ${`%${searchTerm}%`}
    ORDER BY id ASC
  `
  return result as ProcessoNegocio[]
}

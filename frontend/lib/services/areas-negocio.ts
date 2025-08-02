import { sql, type AreaNegocio } from "@/lib/database"

export interface AreaNegocioAPI {
  id: number
  codigo: string
  nome: string
  created_at?: string
  updated_at?: string
}

export async function getAreasNegocio(): Promise<AreaNegocioAPI[]> {
  try {
    const result = await sql`
      SELECT * FROM areas_negocio 
      ORDER BY codigo ASC
    `
    return (result as AreaNegocio[]).map(area => ({
      id: area.id,
      codigo: area.codigo,
      nome: area.nome,
      created_at: area.created_at ? new Date(area.created_at).toISOString() : "",
      updated_at: area.updated_at ? new Date(area.updated_at).toISOString() : "",
    }))
  } catch (error) {
    console.error("Erro getAreasNegocio:", error)
    throw error
  }
}

export async function createAreaNegocio(nome: string): Promise<AreaNegocio> {
  // Gerar próximo código
  const lastArea = await sql`
    SELECT codigo FROM areas_negocio 
    ORDER BY codigo DESC 
    LIMIT 1
  `

  let nextNumber = 1
  if (lastArea.length > 0) {
    const lastCode = lastArea[0].codigo as string
    const lastNumber = Number.parseInt(lastCode.split("-")[1])
    nextNumber = lastNumber + 1
  }

  const codigo = `ARN-${String(nextNumber).padStart(2, "0")}`

  const result = await sql`
    INSERT INTO areas_negocio (codigo, nome)
    VALUES (${codigo}, ${nome})
    RETURNING *
  `

  return result[0] as AreaNegocio
}

export async function updateAreaNegocio(id: number, nome: string): Promise<AreaNegocio> {
  const result = await sql`
    UPDATE areas_negocio 
    SET nome = ${nome}
    WHERE id = ${id}
    RETURNING *
  `

  return result[0] as AreaNegocio
}

export async function deleteAreaNegocio(id: number): Promise<void> {
  await sql`
    DELETE FROM areas_negocio 
    WHERE id = ${id}
  `
}

export async function searchAreasNegocio(searchTerm: string): Promise<AreaNegocio[]> {
  const result = await sql`
    SELECT * FROM areas_negocio 
    WHERE nome ILIKE ${`%${searchTerm}%`}
    ORDER BY codigo ASC
  `
  return result as AreaNegocio[]
}

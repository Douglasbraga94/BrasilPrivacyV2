import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set")
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const text = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `$${i + 1}` : ""), "")
  const params = values
  try {
    const result = await pool.query(text, params)
    return result.rows
  } catch (error) {
    console.error("Erro no banco de dados:", error, { text, params })
    throw error
  }
}

// Tipos TypeScript para as tabelas
export interface AreaNegocio {
  id: number
  codigo: string
  nome: string
  created_at: Date
  updated_at: Date
}

export interface ProcessoNegocio {
  id: number
  codigo: string
  nome: string
  descricao?: string
  area_responsavel: string
  nome_responsavel: string
  email: string
  status: "Ativo" | "Inativo"
  created_at: Date
  updated_at: Date
}

export interface LocalColeta {
  id: number
  codigo: string
  nome: string
  descricao?: string
  tipo: string
  created_at: Date
  updated_at: Date
}

export interface Finalidade {
  id: number
  codigo: string
  descricao: string
  created_at: Date
  updated_at: Date
}

export interface CategoriaTitular {
  id: number
  codigo: string
  tipo_titular: string
  created_at: Date
  updated_at: Date
}

export interface DadoPessoal {
  id: number
  codigo: string
  tipo_dados: string
  created_at: Date
  updated_at: Date
}

export interface DadoSensivel {
  id: number
  codigo: string
  tipo_dados: string
  created_at: Date
  updated_at: Date
}

export interface BaseLegal {
  id: number
  codigo: string
  hipotese_tratamento: string
  outra_legislacao?: string
  created_at: Date
  updated_at: Date
}

export interface Compartilhamento {
  id: number
  codigo: string
  tipo_transicao: "Dentro do país" | "Transferência internacional"
  nome: string
  responsavel_envio: string
  operador_destino: string
  finalidade_compartilhamento: string
  procedimento: string
  pais_destino?: string
  created_at: Date
  updated_at: Date
}

export interface RetencaoDescarte {
  id: number
  codigo: string
  periodo: "Anos" | "Meses" | "Semanas" | "Dias"
  duracao: number
  disposicao_final: string
  procedimento_eliminacao: string
  created_at: Date
  updated_at: Date
}

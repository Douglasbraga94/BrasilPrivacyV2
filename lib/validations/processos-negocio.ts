export interface ProcessoNegocioValidation {
  isValid: boolean
  errors: string[]
}

export const validateProcessoNegocio = (data: {
  nome: string
  descricao?: string
  area_responsavel: string
  nome_responsavel: string
  email: string
  status: string
}): ProcessoNegocioValidation => {
  const errors: string[] = []

  // Validar nome
  if (!data.nome || data.nome.trim().length === 0) {
    errors.push("Nome do processo é obrigatório")
  } else if (data.nome.trim().length < 3) {
    errors.push("Nome do processo deve ter pelo menos 3 caracteres")
  } else if (data.nome.trim().length > 255) {
    errors.push("Nome do processo deve ter no máximo 255 caracteres")
  }

  // Validar área responsável
  if (!data.area_responsavel || data.area_responsavel.trim().length === 0) {
    errors.push("Área responsável é obrigatória")
  }

  // Validar nome do responsável
  if (!data.nome_responsavel || data.nome_responsavel.trim().length === 0) {
    errors.push("Nome do responsável é obrigatório")
  } else if (data.nome_responsavel.trim().length < 2) {
    errors.push("Nome do responsável deve ter pelo menos 2 caracteres")
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || data.email.trim().length === 0) {
    errors.push("E-mail é obrigatório")
  } else if (!emailRegex.test(data.email)) {
    errors.push("E-mail deve ter um formato válido")
  }

  // Validar status
  if (!["Ativo", "Inativo"].includes(data.status)) {
    errors.push("Status deve ser Ativo ou Inativo")
  }

  // Validar descrição se fornecida
  if (data.descricao && data.descricao.length > 1000) {
    errors.push("Descrição deve ter no máximo 1000 caracteres")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateProcessoNegocioDelete = async (id: number): Promise<ProcessoNegocioValidation> => {
  const errors: string[] = []

  try {
    // Verificar se o processo está sendo usado em outros módulos
    const response = await fetch(`/api/processos-negocio/${id}/dependencies`)
    const dependencies = await response.json()

    if (dependencies.mapeamentos && dependencies.mapeamentos.length > 0) {
      errors.push(`Este processo está sendo usado em ${dependencies.mapeamentos.length} mapeamento(s) de dados`)
    }

    if (dependencies.outros && dependencies.outros.length > 0) {
      errors.push("Este processo possui outras dependências no sistema")
    }
  } catch (error) {
    errors.push("Erro ao verificar dependências")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

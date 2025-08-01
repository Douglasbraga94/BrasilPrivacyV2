export interface AreaNegocioValidation {
  isValid: boolean
  errors: string[]
}

export const validateAreaNegocio = (nome: string): AreaNegocioValidation => {
  const errors: string[] = []

  // Validar nome
  if (!nome || nome.trim().length === 0) {
    errors.push("Nome é obrigatório")
  } else if (nome.trim().length < 2) {
    errors.push("Nome deve ter pelo menos 2 caracteres")
  } else if (nome.trim().length > 255) {
    errors.push("Nome deve ter no máximo 255 caracteres")
  }

  // Validar caracteres especiais
  const invalidChars = /[<>{}[\]\\/]/
  if (invalidChars.test(nome)) {
    errors.push("Nome contém caracteres inválidos")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateAreaNegocioDelete = async (id: number): Promise<AreaNegocioValidation> => {
  const errors: string[] = []

  try {
    // Verificar se a área está sendo usada em processos de negócio
    const response = await fetch(`/api/areas-negocio/${id}/dependencies`)
    const dependencies = await response.json()

    if (dependencies.processos && dependencies.processos.length > 0) {
      errors.push(`Esta área está sendo usada em ${dependencies.processos.length} processo(s) de negócio`)
    }

    if (dependencies.outros && dependencies.outros.length > 0) {
      errors.push("Esta área possui outras dependências no sistema")
    }
  } catch (error) {
    errors.push("Erro ao verificar dependências")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

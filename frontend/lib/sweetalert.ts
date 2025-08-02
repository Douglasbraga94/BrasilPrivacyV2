import Swal from "sweetalert2"

// Configuração padrão do SweetAlert
const defaultConfig = {
  confirmButtonColor: "#3b82f6",
  cancelButtonColor: "#ef4444",
  confirmButtonText: "Sim",
  cancelButtonText: "Cancelar",
}

// Alert de confirmação para exclusão
export const confirmDelete = async (
  title = "Tem certeza?",
  text = "Esta ação não pode ser desfeita!",
  confirmButtonText = "Sim, excluir!",
) => {
  return await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    ...defaultConfig,
    customClass: {
      popup: "rounded-lg",
      confirmButton: "rounded-md px-4 py-2 font-medium",
      cancelButton: "rounded-md px-4 py-2 font-medium",
    },
    zIndex: 11000,
  })
}

// Alert de sucesso
export const showSuccess = (title = "Sucesso!", text?: string, timer = 3000) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    timer,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
    timerProgressBar: true,
    customClass: {
      popup: "rounded-lg shadow-lg",
    },
    zIndex: 11000,
  })
}

// Alert de erro
export const showError = (title = "Erro!", text = "Algo deu errado. Tente novamente.", showConfirmButton = true) => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "OK",
    confirmButtonColor: defaultConfig.confirmButtonColor,
    showConfirmButton,
    customClass: {
      popup: "rounded-lg",
      confirmButton: "rounded-md px-4 py-2 font-medium",
    },
    zIndex: 11000,
  })
}

// Alert de loading
export const showLoading = (title = "Carregando...") => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    customClass: {
      popup: "rounded-lg",
    },
    zIndex: 11000,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

// Alert customizado para validações com lista de erros
export const showValidationError = (errors: string[]) => {
  const errorList = errors
    .map(
      (error) => `
    <div class="flex items-start space-x-2 mb-2">
      <div class="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
      <span class="text-gray-700">${error}</span>
    </div>
  `,
    )
    .join("")

  return Swal.fire({
    title: "Dados inválidos",
    html: `
      <div class="text-left bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <div class="text-sm text-red-800 font-medium mb-3">Por favor, corrija os seguintes erros:</div>
        <div class="space-y-1">
          ${errorList}
        </div>
      </div>
    `,
    icon: "error",
    confirmButtonText: "Entendi",
    confirmButtonColor: defaultConfig.confirmButtonColor,
    customClass: {
      popup: "rounded-lg",
      confirmButton: "rounded-md px-4 py-2 font-medium",
      htmlContainer: "text-left",
    },
    zIndex: 11000,
  })
}

// Alert de informação
export const showInfo = (title: string, text?: string, confirmButtonText = "OK") => {
  return Swal.fire({
    title,
    text,
    icon: "info",
    confirmButtonText,
    confirmButtonColor: defaultConfig.confirmButtonColor,
    customClass: {
      popup: "rounded-lg",
      confirmButton: "rounded-md px-4 py-2 font-medium",
    },
    zIndex: 11000,
  })
}

// Alert de aviso
export const showWarning = (title: string, text?: string, confirmButtonText = "OK") => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    confirmButtonText,
    confirmButtonColor: defaultConfig.confirmButtonColor,
    customClass: {
      popup: "rounded-lg",
      confirmButton: "rounded-md px-4 py-2 font-medium",
    },
    zIndex: 11000,
  })
}

// Alert customizado para dependências (quando não pode excluir)
export const showDependencyError = (itemName: string, dependencies: string[]) => {
  const dependencyList = dependencies
    .map(
      (dep) => `
    <div class="flex items-start space-x-2 mb-2">
      <div class="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
      <span class="text-gray-700">${dep}</span>
    </div>
  `,
    )
    .join("")

  return Swal.fire({
    title: "Não é possível excluir",
    html: `
      <div class="text-left">
        <p class="text-gray-600 mb-4">O item "<strong>${itemName}</strong>" não pode ser excluído pois está sendo usado em:</p>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div class="space-y-1">
            ${dependencyList}
          </div>
        </div>
        <p class="text-sm text-gray-500 mt-4">Remova essas dependências primeiro para poder excluir este item.</p>
      </div>
    `,
    icon: "warning",
    confirmButtonText: "Entendi",
    confirmButtonColor: defaultConfig.confirmButtonColor,
    customClass: {
      popup: "rounded-lg max-w-md",
      confirmButton: "rounded-md px-4 py-2 font-medium",
      htmlContainer: "text-left",
    },
    zIndex: 11000,
    backdrop: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
  })
}

// Alert de confirmação customizado com detalhes
export const confirmDeleteWithDetails = async (itemName: string, itemType: string, details?: string[]) => {
  let detailsHtml = ""
  if (details && details.length > 0) {
    const detailsList = details
      .map(
        (detail) => `
      <div class="flex items-start space-x-2 mb-1">
        <div class="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
        <span class="text-sm text-gray-600">${detail}</span>
      </div>
    `,
      )
      .join("")

    detailsHtml = `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4 mb-4">
        <div class="text-sm font-medium text-gray-700 mb-2">Detalhes do item:</div>
        <div class="space-y-1">
          ${detailsList}
        </div>
      </div>
    `
  }

  return await Swal.fire({
    title: `Excluir ${itemType}?`,
    html: `
      <div class="text-left">
        <p class="text-gray-600 mb-2">Tem certeza que deseja excluir:</p>
        <p class="font-semibold text-gray-800 mb-4">"${itemName}"</p>
        ${detailsHtml}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm text-red-800 font-medium">Esta ação não pode ser desfeita!</span>
          </div>
        </div>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, excluir!",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    customClass: {
      popup: "rounded-lg max-w-lg",
      confirmButton: "rounded-md px-4 py-2 font-medium",
      cancelButton: "rounded-md px-4 py-2 font-medium",
      htmlContainer: "text-left",
    },
    zIndex: 11000,
    backdrop: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    // Forçar foco no modal
    didOpen: () => {
      const popup = Swal.getPopup()
      if (popup) {
        popup.focus()
      }
    },
    // Garantir que os botões sejam clicáveis
    didRender: () => {
      const confirmButton = Swal.getConfirmButton()
      const cancelButton = Swal.getCancelButton()

      if (confirmButton) {
        confirmButton.style.pointerEvents = "auto"
        confirmButton.style.zIndex = "10001"
      }

      if (cancelButton) {
        cancelButton.style.pointerEvents = "auto"
        cancelButton.style.zIndex = "10001"
      }
    },
  })
}

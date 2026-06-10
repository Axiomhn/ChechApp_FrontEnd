export interface Provider {
  id: string
  nombre_razon: string
  rtn: string | null
  telefono: string | null
}

export interface ProviderPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProvidersListResponse {
  success: boolean
  message: string
  data: {
    items: Provider[]
    pagination: ProviderPagination
  }
  code: string
}

export interface ProviderInput {
  nombre_razon: string
  rtn?: string
  telefono?: string
}

export const PROVIDER_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export const DEFAULT_PROVIDER_PAGE_SIZE = 10

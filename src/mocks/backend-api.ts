import type { LoginResponse } from "@/types/auth"
import type { AuthUser } from "@/types/auth"
import type { Provider, ProviderInput } from "@/types/provider"

export const MOCK_ADMIN_EMAIL = "admin@chech.app"
export const MOCK_ADMIN_PASSWORD = "admin123"

const MOCK_USER: AuthUser = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Administrador UMASENY",
  email: MOCK_ADMIN_EMAIL,
  phone: "2678-0000",
  isActive: true,
}

const INITIAL_PROVIDERS: Provider[] = [
  {
    id: "mock-1",
    nombre_razon: "Ferretería El Progreso",
    rtn: "08011990123456",
    telefono: "2678-1234",
  },
  {
    id: "mock-2",
    nombre_razon: "Tuberías y Accesorios del Norte S.A.",
    rtn: "01041985654321",
    telefono: "9876-5432",
  },
  {
    id: "mock-3",
    nombre_razon: "Distribuidora El Negrito",
    rtn: "18041998001223",
    telefono: "3210-9988",
  },
]

let mockProviders: Provider[] = [...INITIAL_PROVIDERS]
let nextProviderId = 4

function mockDelay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mockUnauthorized(): never {
  const error = new Error("Unauthorized") as Error & {
    response?: { status: number }
  }
  error.response = { status: 401 }
  throw error
}

function filterProviders(search: string): Provider[] {
  const q = search.trim().toLowerCase()
  if (!q) return [...mockProviders]

  return mockProviders.filter(
    (p) =>
      p.nombre_razon.toLowerCase().includes(q) ||
      (p.rtn?.toLowerCase().includes(q) ?? false) ||
      (p.telefono?.toLowerCase().includes(q) ?? false)
  )
}

export async function mockLogin(credentials: {
  email: string
  password: string
}): Promise<LoginResponse> {
  await mockDelay()

  const email = credentials.email.trim()
  if (email === MOCK_ADMIN_EMAIL && credentials.password === MOCK_ADMIN_PASSWORD) {
    return {
      success: true,
      message: "Inicio de sesión simulado.",
      code: "MOCK_LOGIN_OK",
      data: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: MOCK_USER,
      },
    }
  }

  mockUnauthorized()
}

export async function mockLogout(): Promise<void> {
  await mockDelay(50)
}

export async function mockListProviders(
  page: number,
  limit: number,
  search: string
) {
  await mockDelay()

  const filtered = filterProviders(search)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * limit

  return {
    items: filtered.slice(start, start + limit),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  }
}

export async function mockCreateProvider(payload: ProviderInput): Promise<Provider> {
  await mockDelay()

  const nombre = payload.nombre_razon.trim()
  if (!nombre) {
    throw new Error("El nombre del proveedor es obligatorio.")
  }

  const duplicate = mockProviders.some(
    (p) => p.nombre_razon.toLowerCase() === nombre.toLowerCase()
  )
  if (duplicate) {
    const error = new Error("UNIQUE constraint failed: nombre_razon") as Error & {
      response?: { status: number; data?: { message?: string } }
    }
    error.response = {
      status: 409,
      data: { message: "Ya existe un proveedor con ese nombre." },
    }
    throw error
  }

  const provider: Provider = {
    id: `mock-${nextProviderId++}`,
    nombre_razon: nombre,
    rtn: payload.rtn?.trim() || null,
    telefono: payload.telefono?.trim() || null,
  }
  mockProviders.push(provider)
  return provider
}

export async function mockUpdateProvider(
  id: string,
  payload: ProviderInput
): Promise<Provider> {
  await mockDelay()

  const index = mockProviders.findIndex((p) => p.id === id)
  if (index === -1) {
    throw new Error("Proveedor no encontrado.")
  }

  const nombre = payload.nombre_razon.trim()
  if (!nombre) {
    throw new Error("El nombre del proveedor es obligatorio.")
  }

  const duplicate = mockProviders.some(
    (p) =>
      p.id !== id && p.nombre_razon.toLowerCase() === nombre.toLowerCase()
  )
  if (duplicate) {
    const error = new Error("UNIQUE constraint failed: nombre_razon") as Error & {
      response?: { status: number; data?: { message?: string } }
    }
    error.response = {
      status: 409,
      data: { message: "Ya existe un proveedor con ese nombre." },
    }
    throw error
  }

  const updated: Provider = {
    id,
    nombre_razon: nombre,
    rtn: payload.rtn?.trim() || null,
    telefono: payload.telefono?.trim() || null,
  }
  mockProviders[index] = updated
  return updated
}

export async function mockDeleteProvider(id: string): Promise<void> {
  await mockDelay()
  mockProviders = mockProviders.filter((p) => p.id !== id)
}

/** Compatibilidad con getAppApi().db en navegador sin Electron. */
export async function mockGetAllProviders(): Promise<Provider[]> {
  await mockDelay(50)
  return [...mockProviders]
}

export async function mockSaveProvider(provider: {
  id: string | null
  nombre_razon: string
  rtn?: string
  telefono?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (provider.id) {
      await mockUpdateProvider(provider.id, provider)
    } else {
      await mockCreateProvider(provider)
    }
    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo guardar el proveedor."
    return { success: false, error: message }
  }
}

export async function mockDeleteProviderResult(
  id: string
): Promise<{ success: boolean }> {
  await mockDeleteProvider(id)
  return { success: true }
}

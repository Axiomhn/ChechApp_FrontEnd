import type { AppSettings, ChechAppApi, Provider } from "@/types/electron"

const INITIAL_PROVIDERS: Provider[] = [
  { id: 1, nombre_razon: "Ferretería El Progreso", rtn: "08011990123456", telefono: "2678-1234" },
  { id: 2, nombre_razon: "Tuberías y Accesorios del Norte S.A.", rtn: "01041985654321", telefono: "9876-5432" },
  { id: 3, nombre_razon: "Distribuidora El Negrito", rtn: "18041998001223", telefono: "3210-9988" },
]

let mockProviders: Provider[] = [...INITIAL_PROVIDERS]
let nextProviderId = 4

const MOCK_SETTINGS: AppSettings = {
  printer_name: "Microsoft Print to PDF",
  print_method: "graphical",
  offset_cheque_fecha_x: "0",
  offset_cheque_fecha_y: "0",
  offset_cheque_monto_x: "0",
  offset_cheque_monto_y: "0",
  offset_cheque_beneficiario_x: "0",
  offset_cheque_beneficiario_y: "0",
  offset_cheque_letras_x: "0",
  offset_cheque_letras_y: "0",
  fuente_tamano: "12",
}

type ProviderInput = {
  id: number | null
  nombre_razon: string
  rtn?: string
  telefono?: string
}

const browserApi: ChechAppApi = {
  db: {
    getProviders: async () => ({
      success: true,
      data: [...mockProviders],
    }),
    saveProvider: async (provider: ProviderInput) => {
      const nombre = provider.nombre_razon.trim()
      const duplicate = mockProviders.some(
        (p) =>
          p.nombre_razon.toLowerCase() === nombre.toLowerCase() &&
          p.id !== provider.id
      )
      if (duplicate) {
        return { success: false, error: "UNIQUE constraint failed: nombre_razon" }
      }

      if (provider.id) {
        const index = mockProviders.findIndex((p) => p.id === provider.id)
        if (index === -1) {
          return { success: false, error: "Proveedor no encontrado." }
        }
        mockProviders[index] = {
          id: provider.id,
          nombre_razon: nombre,
          rtn: provider.rtn?.trim() || null,
          telefono: provider.telefono?.trim() || null,
        }
      } else {
        mockProviders.push({
          id: nextProviderId++,
          nombre_razon: nombre,
          rtn: provider.rtn?.trim() || null,
          telefono: provider.telefono?.trim() || null,
        })
      }

      return { success: true }
    },
    deleteProvider: async (id: number) => {
      mockProviders = mockProviders.filter((p) => p.id !== id)
      return { success: true }
    },
  },
  config: {
    getSettings: async () => ({ success: true, data: MOCK_SETTINGS }),
  },
  print: {
    nativeEscP: async () => ({
      success: false,
      error: "Impresión nativa disponible al ejecutar en Electron.",
    }),
    graphical: async () => ({
      success: false,
      error: "Impresión gráfica disponible al ejecutar en Electron.",
    }),
  },
}

export function getAppApi(): ChechAppApi {
  return window.api ?? browserApi
}

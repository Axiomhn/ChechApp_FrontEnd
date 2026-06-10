import type { ChechAppApi, Provider } from "@/types/electron"
import type { CalibrationSettings, PrinterInfo } from "@/types/calibration"
import {
  loadBrowserCalibration,
  saveBrowserCalibration,
} from "@/lib/calibration-storage"

const INITIAL_PROVIDERS: Provider[] = [
  { id: "mock-1", nombre_razon: "Ferretería El Progreso", rtn: "08011990123456", telefono: "2678-1234" },
  { id: "mock-2", nombre_razon: "Tuberías y Accesorios del Norte S.A.", rtn: "01041985654321", telefono: "9876-5432" },
  { id: "mock-3", nombre_razon: "Distribuidora El Negrito", rtn: "18041998001223", telefono: "3210-9988" },
]

let mockProviders: Provider[] = [...INITIAL_PROVIDERS]
let nextProviderId = 4

const MOCK_PRINTERS: PrinterInfo[] = [
  { name: "Microsoft Print to PDF", isDefault: true },
  { name: "EPSON LX-350", isDefault: false },
]

type ProviderInput = {
  id: string | null
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
          id: `mock-${nextProviderId++}`,
          nombre_razon: nombre,
          rtn: provider.rtn?.trim() || null,
          telefono: provider.telefono?.trim() || null,
        })
      }

      return { success: true }
    },
    deleteProvider: async (id: string) => {
      mockProviders = mockProviders.filter((p) => p.id !== id)
      return { success: true }
    },
  },
  config: {
    getSettings: async () => ({
      success: true,
      data: loadBrowserCalibration(),
    }),
    saveSettings: async (settings: CalibrationSettings) => {
      const data = saveBrowserCalibration(settings)
      return { success: true, data }
    },
    getPrinters: async () => MOCK_PRINTERS,
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

let electronMergedApi: ChechAppApi | null = null

export function getAppApi(): ChechAppApi {
  const electronApi = window.api
  if (!electronApi) return browserApi

  if (!electronMergedApi) {
    electronMergedApi = {
      ...browserApi,
      config: electronApi.config,
      print: electronApi.print ?? browserApi.print,
    }
  }

  return electronMergedApi
}

import type { AppSettings, ChechAppApi, Provider } from "@/types/electron"
import type { CalibrationSettings, PrinterInfo } from "@/types/calibration"

const INITIAL_PROVIDERS: Provider[] = [
  { id: "mock-1", nombre_razon: "Ferretería El Progreso", rtn: "08011990123456", telefono: "2678-1234" },
  { id: "mock-2", nombre_razon: "Tuberías y Accesorios del Norte S.A.", rtn: "01041985654321", telefono: "9876-5432" },
  { id: "mock-3", nombre_razon: "Distribuidora El Negrito", rtn: "18041998001223", telefono: "3210-9988" },
]

let mockProviders: Provider[] = [...INITIAL_PROVIDERS]
let nextProviderId = 4

let mockSettings: AppSettings = {
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

const MOCK_PRINTERS: PrinterInfo[] = [
  { name: "Microsoft Print to PDF", isDefault: true },
  { name: "EPSON LX-350", isDefault: false },
]

function settingsToAppSettings(settings: CalibrationSettings): AppSettings {
  return {
    printer_name: settings.printer_name,
    print_method: settings.print_method,
    offset_cheque_fecha_x: String(settings.offset_cheque_fecha_x),
    offset_cheque_fecha_y: String(settings.offset_cheque_fecha_y),
    offset_cheque_monto_x: String(settings.offset_cheque_monto_x),
    offset_cheque_monto_y: String(settings.offset_cheque_monto_y),
    offset_cheque_beneficiario_x: String(settings.offset_cheque_beneficiario_x),
    offset_cheque_beneficiario_y: String(settings.offset_cheque_beneficiario_y),
    offset_cheque_letras_x: String(settings.offset_cheque_letras_x),
    offset_cheque_letras_y: String(settings.offset_cheque_letras_y),
    fuente_tamano: String(settings.fuente_tamano),
  }
}

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
    getSettings: async () => ({ success: true, data: { ...mockSettings } }),
    saveSettings: async (settings: CalibrationSettings) => {
      mockSettings = settingsToAppSettings(settings)
      return { success: true }
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

export function getAppApi(): ChechAppApi {
  return window.api ?? browserApi
}

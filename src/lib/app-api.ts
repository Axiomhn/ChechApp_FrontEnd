import type { ChechAppApi } from "@/types/electron"
import type { CalibrationSettings } from "@/types/calibration"
import {
  loadBrowserCalibration,
  saveBrowserCalibration,
} from "@/lib/calibration-storage"
import {
  mockDeleteProviderResult,
  mockGetAllProviders,
  mockSaveProvider,
} from "@/mocks/backend-api"

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
      data: await mockGetAllProviders(),
    }),
    saveProvider: async (provider: ProviderInput) =>
      mockSaveProvider(provider),
    deleteProvider: async (id: string) => mockDeleteProviderResult(id),
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
    getPrinters: async () => [],
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

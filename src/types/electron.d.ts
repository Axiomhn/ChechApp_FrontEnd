import type { CalibrationSettings, PrinterInfo } from "./calibration"

export interface Provider {
  id: string
  nombre_razon: string
  rtn: string | null
  telefono: string | null
}

export interface AppSettings {
  printer_name?: string
  offset_cheque_fecha_x?: string
  offset_cheque_fecha_y?: string
  offset_cheque_monto_x?: string
  offset_cheque_monto_y?: string
  offset_cheque_beneficiario_x?: string
  offset_cheque_beneficiario_y?: string
  offset_cheque_letras_x?: string
  offset_cheque_letras_y?: string
  fuente_tamano?: string
}

export interface PrintPayload {
  fecha: string
  beneficiario: string
  monto: string
  montoLetras: string
  rtn?: string
}

export interface PrintOffsets {
  fecha_x: number
  fecha_y: number
  monto_x: number
  monto_y: number
  beneficiario_x: number
  beneficiario_y: number
  letras_x: number
  letras_y: number
}

interface ApiResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  user?: { nombre_completo?: string; name?: string }
}

type ProviderInput = {
  id: string | null
  nombre_razon: string
  rtn?: string
  telefono?: string
}

export interface ChechAppApi {
  db: {
    getProviders: () => Promise<ApiResult<Provider[]>>
    saveProvider: (provider: ProviderInput) => Promise<ApiResult>
    deleteProvider: (id: string) => Promise<ApiResult>
  }
  config: {
    getSettings: () => Promise<ApiResult<AppSettings>>
    saveSettings: (settings: CalibrationSettings) => Promise<ApiResult>
    getPrinters: () => Promise<PrinterInfo[]>
  }
  print: {
    nativeEscP: (
      printerName: string,
      documentType: string,
      data: PrintPayload,
      offsets: PrintOffsets
    ) => Promise<ApiResult>
    graphical: (
      documentType: string,
      data: PrintPayload,
      offsets: PrintOffsets
    ) => Promise<ApiResult>
  }
}

declare global {
  interface Window {
    api?: ChechAppApi
  }
}

export {}

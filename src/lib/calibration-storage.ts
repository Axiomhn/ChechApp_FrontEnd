import type { AppSettings } from "@/types/electron"
import type { CalibrationSettings } from "@/types/calibration"
import { defaultCalibrationSettings } from "@/types/calibration"

const STORAGE_KEY = "chech-app-calibration"

export const defaultAppSettings = (): AppSettings => {
  const defaults = defaultCalibrationSettings()
  return {
    printer_name: defaults.printer_name,
    offset_cheque_fecha_x: String(defaults.offset_cheque_fecha_x),
    offset_cheque_fecha_y: String(defaults.offset_cheque_fecha_y),
    offset_cheque_monto_x: String(defaults.offset_cheque_monto_x),
    offset_cheque_monto_y: String(defaults.offset_cheque_monto_y),
    offset_cheque_beneficiario_x: String(defaults.offset_cheque_beneficiario_x),
    offset_cheque_beneficiario_y: String(defaults.offset_cheque_beneficiario_y),
    offset_cheque_letras_x: String(defaults.offset_cheque_letras_x),
    offset_cheque_letras_y: String(defaults.offset_cheque_letras_y),
    fuente_tamano: String(defaults.fuente_tamano),
  }
}

export function settingsToAppSettings(settings: CalibrationSettings): AppSettings {
  return {
    printer_name: settings.printer_name,
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

export function loadBrowserCalibration(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAppSettings()
    return { ...defaultAppSettings(), ...JSON.parse(raw) }
  } catch {
    return defaultAppSettings()
  }
}

export function saveBrowserCalibration(settings: CalibrationSettings): AppSettings {
  const data = settingsToAppSettings(settings)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

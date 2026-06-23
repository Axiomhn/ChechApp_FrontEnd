export interface CalibrationSettings {
  offset_cheque_fecha_x: number
  offset_cheque_fecha_y: number
  offset_cheque_monto_x: number
  offset_cheque_monto_y: number
  offset_cheque_beneficiario_x: number
  offset_cheque_beneficiario_y: number
  offset_cheque_letras_x: number
  offset_cheque_letras_y: number
  fuente_tamano: number
}

export const defaultCalibrationSettings = (): CalibrationSettings => ({
  offset_cheque_fecha_x: 0,
  offset_cheque_fecha_y: 0,
  offset_cheque_monto_x: 0,
  offset_cheque_monto_y: 0,
  offset_cheque_beneficiario_x: 0,
  offset_cheque_beneficiario_y: 0,
  offset_cheque_letras_x: 0,
  offset_cheque_letras_y: 0,
  fuente_tamano: 12,
})

export interface PrinterInfo {
  name: string
  isDefault?: boolean
}

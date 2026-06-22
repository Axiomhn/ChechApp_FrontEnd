export const DESCRIPCION_ROW_COUNT = 4
export const ESTRUCTURA_ROW_COUNT = 5
export const DESCRIPCION_MAX_LENGTH = 100
export const DETALLE_GASTO_MAX_LENGTH = 80

export type EstructuraRow = {
  detalle: string
  subTotal: string
}

export type OrdenPagoTablePayload = {
  descripciones: string[]
  estructura: EstructuraRow[]
}

export function createEmptyDescripciones(): string[] {
  return Array.from({ length: DESCRIPCION_ROW_COUNT }, () => "")
}

export function createEmptyEstructura(): EstructuraRow[] {
  return Array.from({ length: ESTRUCTURA_ROW_COUNT }, () => ({
    detalle: "",
    subTotal: "",
  }))
}

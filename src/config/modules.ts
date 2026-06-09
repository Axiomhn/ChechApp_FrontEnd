export interface ModuleMeta {
  title: string
  sub: string
}

export const MODULE_META: Record<string, ModuleMeta> = {
  "/emission": {
    title: "Módulo de Emisión",
    sub: "Llena y emite cheques u órdenes de pago",
  },
  "/providers": {
    title: "Catálogo de Proveedores",
    sub: "Gestión CRUD de beneficiarios registrados",
  },
  "/calibration": {
    title: "Ajustes de Impresión",
    sub: "Calibración fina de coordenadas del cheque LX-350",
  },
}

export const DEFAULT_MODULE_META: ModuleMeta = {
  title: "Chech App",
  sub: "Sistema de gestión de cheques",
}

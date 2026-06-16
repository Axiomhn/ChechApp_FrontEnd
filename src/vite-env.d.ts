/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  /** "true" | "1" activa login y catálogo de proveedores simulados (sin backend). */
  readonly VITE_USE_API_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** true cuando VITE_USE_API_MOCKS está activo (login, proveedores, etc. sin backend). */
export function isApiMocksEnabled(): boolean {
  const raw = import.meta.env.VITE_USE_API_MOCKS
  if (raw === undefined || raw === "") return false
  return raw === "true" || raw === "1"
}

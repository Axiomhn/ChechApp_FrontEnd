/** Normaliza texto para impresión (cheque ESC/P y orden gráfica). */
export function toPrintText(value: string): string {
  return String(value ?? "").toLocaleUpperCase("es-HN")
}
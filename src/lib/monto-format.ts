/** Parsea monto con o sin separadores de miles (ej. 935,123.23). */
export function parseMontoInput(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim()
  if (!cleaned || cleaned === ".") return null
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

/** Formato estándar: miles con coma, 2 decimales (ej. 935,123.23). */
export function formatMontoNumber(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatMontoDisplay(
  value: string | number | null | undefined
): string {
  const n =
    typeof value === "number" ? value : parseMontoInput(String(value ?? ""))
  if (n === null) return ""
  return formatMontoNumber(n)
}

/** Formatea mientras el usuario escribe en el campo de monto. */
export function formatMontoInputWhileTyping(raw: string): string {
  const withoutCommas = raw.replace(/,/g, "")
  if (withoutCommas === "") return ""

  const dotIndex = withoutCommas.indexOf(".")
  let intPart: string
  let decPart: string | undefined

  if (dotIndex === -1) {
    intPart = withoutCommas.replace(/\D/g, "")
    decPart = undefined
  } else {
    intPart = withoutCommas.slice(0, dotIndex).replace(/\D/g, "")
    decPart = withoutCommas
      .slice(dotIndex + 1)
      .replace(/\D/g, "")
      .slice(0, 2)
  }

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  if (decPart !== undefined) {
    const base = intPart === "" ? "0" : formattedInt
    return `${base}.${decPart}`
  }
  if (withoutCommas.includes(".")) {
    return `${intPart === "" ? "0" : formattedInt}.`
  }
  return formattedInt
}

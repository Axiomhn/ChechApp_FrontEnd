const UNIDADES = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
const DECENAS: Record<number, string | Record<number, string>> = {
  0: "",
  1: { 0: "DIEZ", 1: "ONCE", 2: "DOCE", 3: "TRECE", 4: "CATORCE", 5: "QUINCE", 6: "DIECISÉIS", 7: "DIECISIETE", 8: "DIECIOCHO", 9: "DIECINUEVE" },
  2: { 0: "VEINTE", 1: "VEINTIÚN", 2: "VEINTIDÓS", 3: "VEINTITRÉS", 4: "VEINTICUATRO", 5: "VEINTICINCO", 6: "VEINTISÉIS", 7: "VEINTISIETE", 8: "VEINTIOCHO", 9: "VEINTINUEVE" },
  3: "TREINTA",
  4: "CUARENTA",
  5: "CINCUENTA",
  6: "SESENTA",
  7: "SETENTA",
  8: "OCHENTA",
  9: "NOVENTA",
}
const CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"]

function convertirDecenas(num: number): string {
  if (num < 10) return UNIDADES[num]
  const d = Math.floor(num / 10)
  const u = num % 10

  if (d === 1 || d === 2) {
    return (DECENAS[d] as Record<number, string>)[u]
  }

  if (u > 0) {
    const unidadStr = u === 1 ? "UN" : UNIDADES[u]
    return `${DECENAS[d]} Y ${unidadStr}`
  }

  return DECENAS[d] as string
}

function convertirCentenas(num: number): string {
  if (num === 100) return "CIEN"
  const c = Math.floor(num / 100)
  const resto = num % 100

  if (resto > 0) {
    return `${CENTENAS[c]} ${convertirDecenas(resto)}`
  }
  return CENTENAS[c]
}

function convertirSeccion(num: number): string {
  if (num < 100) return convertirDecenas(num)
  return convertirCentenas(num)
}

export function numberToLetters(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return ""
  }

  const numericValue = parseFloat(String(amount))
  if (numericValue < 0) {
    return "MENOS " + numberToLetters(Math.abs(numericValue))
  }

  const parteEntera = Math.floor(numericValue)
  const centavos = Math.round((numericValue - parteEntera) * 100)

  let letrasEntera = ""

  if (parteEntera === 0) {
    letrasEntera = "CERO"
  } else {
    const millones = Math.floor(parteEntera / 1000000)
    const restoMillones = parteEntera % 1000000
    const miles = Math.floor(restoMillones / 1000)
    const unidades = restoMillones % 1000

    if (millones > 0) {
      letrasEntera += millones === 1 ? "UN MILLÓN " : `${convertirSeccion(millones)} MILLONES `
    }

    if (miles > 0) {
      letrasEntera += miles === 1 ? "MIL " : `${convertirSeccion(miles)} MIL `
    }

    if (unidades > 0) {
      letrasEntera += convertirSeccion(unidades)
    }
  }

  letrasEntera = letrasEntera.trim().replace(/\s+/g, " ")

  let moneda = "LEMPIRAS"
  let adjetivoExacto = "EXACTOS"

  if (parteEntera === 1) {
    moneda = "LEMPIRA"
    adjetivoExacto = "EXACTO"
  }

  if (parteEntera > 0 && parteEntera % 1000000 === 0) {
    moneda = `DE ${moneda}`
  }

  const letrasCentavos =
    centavos === 0
      ? `${moneda} ${adjetivoExacto}`
      : `${moneda} CON ${centavos.toString().padStart(2, "0")}/100`

  return `${letrasEntera} ${letrasCentavos}`.trim().replace(/\s+/g, " ")
}

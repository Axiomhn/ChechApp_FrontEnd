export function generateDefaultFecha() {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const d = new Date()
  const dia = d.getDate().toString().padStart(2, "0")
  const mes = meses[d.getMonth()]
  const anio = d.getFullYear()
  return `El Negrito, Yoro, ${dia} de ${mes} de ${anio}`
}

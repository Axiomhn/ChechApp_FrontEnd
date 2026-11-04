import api from "@/lib/axios"

export type OrdenPagoNumber = {
  numero: number
  display: string
}

export async function reserveOrdenPagoNumber(): Promise<OrdenPagoNumber> {
  const response = await api.post<{ data: OrdenPagoNumber }>(
    "/orden-pago/next-number"
  )
  return response.data.data
}

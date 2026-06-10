import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  Provider,
  ProviderInput,
  ProvidersListResponse,
} from "@/types/provider"

export const providersQueryKey = (
  page: number,
  limit: number,
  search: string
) => ["providers", page, limit, search] as const

export const useProvidersQuery = (
  page: number,
  limit: number,
  search: string
) => {
  return useQuery({
    queryKey: providersQueryKey(page, limit, search),
    queryFn: async () => {
      const response = await api.get<ProvidersListResponse>("/providers", {
        params: { page, limit, search: search || undefined },
      })
      return response.data.data
    },
  })
}

export const useCreateProviderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProviderInput) => {
      const response = await api.post<{ data: Provider }>("/providers", payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] })
    },
  })
}

export const useUpdateProviderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ProviderInput & { id: string }) => {
      const response = await api.put<{ data: Provider }>(
        `/providers/${id}`,
        payload
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] })
    },
  })
}

export const useDeleteProviderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/providers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { isApiMocksEnabled } from "@/lib/env"
import {
  mockCreateProvider,
  mockDeleteProvider,
  mockListProviders,
  mockUpdateProvider,
} from "@/mocks/backend-api"
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
      if (isApiMocksEnabled()) {
        return mockListProviders(page, limit, search)
      }
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
      if (isApiMocksEnabled()) {
        const provider = await mockCreateProvider(payload)
        return { data: provider }
      }
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
      if (isApiMocksEnabled()) {
        const provider = await mockUpdateProvider(id, payload)
        return { data: provider }
      }
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
      if (isApiMocksEnabled()) {
        await mockDeleteProvider(id)
        return
      }
      await api.delete(`/providers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] })
    },
  })
}

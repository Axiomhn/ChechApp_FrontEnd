import { useMutation } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import api from "@/lib/axios"
import { logout, setCredentials } from "@/store/slices/authSlice"
import type { LoginResponse } from "@/types/auth"

export const useLoginMutation = () => {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post<LoginResponse>("/auth/login", credentials)
      return response.data
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data.data
      dispatch(setCredentials({ accessToken, refreshToken, user }))
    },
  })
}

export const useLogoutMutation = () => {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post("/auth/logout")
      } catch {
        // Siempre limpiar sesión local aunque falle el servidor
      }
    },
    onSettled: () => {
      dispatch(logout())
    },
  })
}

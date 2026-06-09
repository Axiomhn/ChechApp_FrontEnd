import { useMutation } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import api from "@/lib/axios"
import { setCredentials } from "@/store/slices/authSlice"
import { MOCK_AUTH_ENABLED, mockLogin } from "@/lib/mock-auth"

export const useLoginMutation = () => {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      if (MOCK_AUTH_ENABLED) {
        return mockLogin(credentials)
      }
      const response = await api.post("/auth/login", credentials)
      return response.data
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data.data
      dispatch(setCredentials({ accessToken, refreshToken, user }))
    },
  })
}

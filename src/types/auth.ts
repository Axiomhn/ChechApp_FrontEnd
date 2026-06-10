export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string | null
  isActive?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: AuthTokens & { user: AuthUser }
  code: string
}

export interface RefreshResponse {
  success: boolean
  message: string
  data: AuthTokens
  code: string
}

export const MOCK_AUTH_ENABLED = import.meta.env.VITE_MOCK_AUTH === "true"

export const MOCK_CREDENTIALS = {
  email: "admin@chech.app",
  password: "admin123",
} as const

export async function mockLogin(credentials: {
  email: string
  password: string
}) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const email = credentials.email.trim().toLowerCase()
  const password = credentials.password

  if (
    email !== MOCK_CREDENTIALS.email ||
    password !== MOCK_CREDENTIALS.password
  ) {
    const error = new Error("Invalid credentials") as Error & {
      response?: { status: number }
    }
    error.response = { status: 401 }
    throw error
  }

  return {
    data: {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: 1,
        name: "Administrador Chech App",
        email: MOCK_CREDENTIALS.email,
        role: "admin",
      },
    },
  }
}

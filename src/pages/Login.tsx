import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, type Resolver } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { User, Lock, AlertCircle, Shield, Loader2, Droplets } from "lucide-react"
import { useLoginMutation } from "@/api/auth"
import { MOCK_AUTH_ENABLED, MOCK_CREDENTIALS } from "@/lib/mock-auth"
import { cn } from "@/lib/utils"

const schema = yup.object({
  email: yup.string().trim().required("Por favor complete todos los campos."),
  password: yup.string().required("Por favor complete todos los campos."),
}).required()

interface IFormInput {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(schema) as Resolver<IFormInput>,
  })

  const loginMutation = useLoginMutation()

  const validationError =
    errors.email?.message || errors.password?.message || ""
  const displayError = serverError || validationError

  const onSubmit = (data: IFormInput) => {
    setServerError("")
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => navigate("/emission"),
        onError: (err) => {
          const status = (err as { response?: { status?: number } })?.response?.status
          setServerError(
            status === 401
              ? "Usuario o contraseña incorrectos."
              : "Error de comunicación con el servidor."
          )
        },
      }
    )
  }

  const isLoading = loginMutation.isPending

  return (
    <div className="flex h-screen bg-white">
      {/* Panel izquierdo — identidad institucional */}
      <div className="relative flex w-[420px] min-w-[420px] flex-col items-center justify-center overflow-hidden bg-[#0D3B66] px-10 py-12">
        <div
          className="pointer-events-none absolute -left-[100px] -top-[100px] h-[400px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(74,144,226,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,168,232,0.2) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
          <Droplets size={38} color="#FFFFFF" />
        </div>

        <h1 className="relative z-10 text-center text-[28px] font-extrabold tracking-tight text-white">
          UMASENY
        </h1>
        <p className="relative z-10 mt-2 text-center text-xs leading-relaxed text-white/60">
          Unidad Desconcentrada Municipal
          <br />
          de Agua y Saneamiento
          <br />
          El Negrito, Yoro · Honduras
        </p>

        <div className="relative z-10 my-5 h-0.5 w-10 rounded-sm bg-[#4A90E2]" />

        <div className="relative z-10 text-center">
          <p className="text-[11px] leading-relaxed text-white/40">
            <Shield
              size={12}
              className="mr-1 inline-block align-middle"
            />
            Sistema monousuario — acceso estrictamente local
            <br />
            Sin conexión a internet requerida
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="animate-fade-slide-in w-full max-w-[380px]">
          <h2 className="mb-1.5 text-2xl font-bold text-[#0D3B66]">
            Iniciar Sesión
          </h2>
          <p className="mb-8 text-[13px] text-[#6B7C93]">
            Sistema de Emisión de Cheques y Órdenes de Pago
          </p>

          {displayError && (
            <div
              className="mb-4 flex animate-fade-slide-in items-start gap-2.5 rounded-lg border border-[#F5B7B1] bg-[#FEF0EE] px-4 py-3 text-[13px] leading-snug text-[#C0392B]"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-[18px] flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-semibold tracking-wide text-[#2C3E50]"
              >
                Usuario
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-[#6B7C93]">
                  <User size={16} />
                </span>
                <input
                  id="email"
                  type="text"
                  autoFocus
                  autoComplete="username"
                  disabled={isLoading}
                  placeholder="Ingrese su usuario"
                  className={cn(
                    "w-full rounded-lg border-[1.5px] border-[#D1DCE8] bg-white py-2.5 pl-[38px] pr-3.5 text-sm text-[#1A1A1A] outline-none transition-[border-color,box-shadow] duration-150",
                    "placeholder:text-[#6B7C93]",
                    "focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_rgba(74,144,226,0.15)]",
                    "disabled:cursor-not-allowed disabled:bg-[#F5F8FC] disabled:text-[#6B7C93]"
                  )}
                  {...register("email")}
                />
              </div>
            </div>

            <div className="mb-7 flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold tracking-wide text-[#2C3E50]"
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-[#6B7C93]">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  placeholder="Ingrese su contraseña"
                  className={cn(
                    "w-full rounded-lg border-[1.5px] border-[#D1DCE8] bg-white py-2.5 pl-[38px] pr-3.5 text-sm text-[#1A1A1A] outline-none transition-[border-color,box-shadow] duration-150",
                    "placeholder:text-[#6B7C93]",
                    "focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_rgba(74,144,226,0.15)]",
                    "disabled:cursor-not-allowed disabled:bg-[#F5F8FC] disabled:text-[#6B7C93]"
                  )}
                  {...register("password")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-1.5 rounded-lg border-none px-7 py-[13px] text-[15px] font-semibold tracking-wide text-white transition-all duration-150",
                "bg-[#0D3B66] shadow-[0_2px_8px_rgba(13,59,102,0.25)]",
                "hover:bg-[#1A5A96] hover:shadow-[0_4px_14px_rgba(13,59,102,0.35)] hover:-translate-y-px",
                "active:translate-y-0 active:shadow-[0_2px_6px_rgba(13,59,102,0.2)]",
                "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:translate-y-0"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                "Entrar al Sistema"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-[#6B7C93]">
            Acceso administrativo · Sin opción de recuperación de contraseña
          </p>

          {MOCK_AUTH_ENABLED && (
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#4A90E2]">
              Modo desarrollo (sin backend)
              <br />
              Usuario: <strong>{MOCK_CREDENTIALS.email}</strong>
              {" · "}
              Contraseña: <strong>{MOCK_CREDENTIALS.password}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { useLoginMutation } from "@/api/auth"
import logo from "@/assets/logo.svg"

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Campo requerido o incorrecto*"),
  password: yup.string().required("Campo requerido o incorrecto*"),
}).required();

interface IFormInput {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
    resolver: yupResolver(schema) as any
  });

  const loginMutation = useLoginMutation()

  const onSubmit = (data: IFormInput) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => navigate("/"),
        onError: () => {},
      }
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-lg border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8 md:p-14 pt-8 flex flex-col gap-7">
          <div className="relative w-full flex flex-col items-center mb-4">
            <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center p-2 mb-2">
              <img
                src={logo}
                alt="Logo Chech App"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 flex flex-col items-center text-center">
              <h1 className="text-3xl font-normal leading-10 text-black font-['Segoe_UI_Symbol']">
                Chech App
              </h1>
              <p className="mt-1 text-xl md:text-2xl font-normal leading-8 text-gray-500 font-['Segoe_UI_Symbol']">
                Sistema de Gestión de Cheques
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7" noValidate>
            <div className="flex w-full flex-col items-start justify-start gap-1">
              <Label
                htmlFor="email"
                className="text-2xl font-normal leading-8 text-black font-['Segoe_UI_Symbol']"
              >
                Usuario
              </Label>

              <div className={`flex w-full items-center justify-start gap-2.5 rounded-md bg-white px-4 py-2.5 shadow-[4px_4px_4px_rgba(0,0,0,0.20)] transition-all ${errors.email ? 'outline-[1px] outline-red-600 outline-solid' : ''}`}>
                <User className="h-6 w-6 text-gray-500" />
                <input
                  id="email"
                  type="text"
                  {...register("email")}
                  placeholder="Usuario"
                  autoComplete="off"
                  className="w-full border-none bg-transparent text-xl md:text-2xl font-normal leading-8 text-black outline-none placeholder:text-gray-500 font-['Segoe_UI_Symbol']"
                />
              </div>

              {errors.email && (
                <div className="flex h-8 w-full flex-col justify-center text-base font-normal leading-8 text-red-600 font-['Segoe_UI_Symbol']">
                  {errors.email.message}
                </div>
              )}
            </div>

            <div className="flex w-full flex-col items-start justify-start gap-1">
              <Label
                htmlFor="password"
                className="text-2xl font-normal leading-8 text-black font-['Segoe_UI_Symbol']"
              >
                Contraseña
              </Label>

              <div className={`flex w-full items-center justify-start gap-2.5 rounded-md bg-white px-4 py-2.5 shadow-[4px_4px_4px_rgba(0,0,0,0.20)] transition-all ${errors.password ? 'outline-[1px] outline-red-600 outline-solid' : ''}`}>
                <Lock className="h-6 w-6 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Contraseña"
                  className="w-full border-none bg-transparent text-xl md:text-2xl font-normal leading-8 text-black outline-none placeholder:text-gray-500 font-['Segoe_UI_Symbol']"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>

              {errors.password && (
                <div className="flex h-8 w-full flex-col justify-center text-base font-normal leading-8 text-red-600 font-['Segoe_UI_Symbol']">
                  {errors.password.message}
                </div>
              )}
            </div>

            {loginMutation.isError && (
              <div className="flex w-full flex-col items-start justify-start gap-2.5 rounded-md bg-blue-50 py-4 pl-6 pr-10 shadow-sm outline-[0.5px] outline-red-600 outline-solid">
                <div className="flex justify-start items-center gap-2.5">
                  <div className="relative h-6 w-6 overflow-hidden flex items-center justify-center">
                    <div className="h-5 w-5 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">!</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-xs font-normal leading-4 text-red-600 font-['Segoe_UI_Symbol'] break-words">
                    {(loginMutation.error as any)?.response?.status === 401
                      ? "Usuario o contraseña inválida"
                      : "Error interno del servidor"}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="h-14 w-full bg-primary text-white text-2xl font-normal rounded-md hover:bg-primary/90 transition-all font-['Segoe_UI_Symbol'] mt-2 cursor-pointer"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar al sistema"
              )}
            </Button>
          </form>

          <div className="w-full text-center mt-2">
            <p className="text-xs leading-8 text-gray-500 font-['Segoe_UI_Symbol']">
              © 2026 Axiom Tech Honduras
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

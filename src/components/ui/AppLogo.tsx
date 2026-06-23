const LOGO_SRC = `${import.meta.env.BASE_URL}icon.jpeg`

type AppLogoProps = {
  className?: string
  alt?: string
}

export default function AppLogo({
  className,
  alt = "UMASENY — Unidad de Agua y Saneamiento El Negrito",
}: AppLogoProps) {
  return <img src={LOGO_SRC} alt={alt} className={className} />
}

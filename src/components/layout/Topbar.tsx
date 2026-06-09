import { useLocation } from "react-router-dom"
import { DEFAULT_MODULE_META, MODULE_META } from "@/config/modules"

const Topbar = () => {
  const { pathname } = useLocation()
  const meta = MODULE_META[pathname] ?? DEFAULT_MODULE_META

  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{meta.title}</div>
        <div className="topbar-breadcrumb">Chech App · {meta.sub}</div>
      </div>
      <span className="topbar-badge">
        {new Date().toLocaleDateString("es-HN")}
      </span>
    </div>
  )
}

export default Topbar

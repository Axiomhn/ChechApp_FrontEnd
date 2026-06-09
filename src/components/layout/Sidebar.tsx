import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Landmark, Users, Sliders, LogOut, Droplets } from "lucide-react"
import type { RootState } from "@/store"
import { logout } from "@/store/slices/authSlice"

const navItems = [
  { to: "/emission", icon: Landmark, label: "Emisión de Egresos" },
  { to: "/providers", icon: Users, label: "Catálogo de Proveedores" },
  { to: "/calibration", icon: Sliders, label: "Ajustes de Cheque" },
]

const Sidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const displayName =
    user?.name || user?.nombre_completo || user?.email || "Usuario"

  const handleLogout = () => {
    if (window.confirm("¿Desea cerrar la sesión del sistema?")) {
      dispatch(logout())
      navigate("/login")
    }
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Droplets size={20} color="#fff" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">UMASENY</span>
              <span className="sidebar-brand-sub">El Negrito, Yoro</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-label">Módulos</span>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{displayName}</div>
          <div className="sidebar-user-role">Operador · UMASENY</div>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-full btn-sm"
          onClick={handleLogout}
          style={{ justifyContent: "center", gap: "7px" }}
        >
          <LogOut size={15} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

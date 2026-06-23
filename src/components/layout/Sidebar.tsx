import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Landmark, Users, Sliders, LogOut } from "lucide-react"
import type { RootState } from "@/store"
import { useLogoutMutation } from "@/api/auth"
import ConfirmModal from "@/components/ui/ConfirmModal"
import AppLogo from "@/components/ui/AppLogo"

const navItems = [
  { to: "/emission", icon: Landmark, label: "Emisión de Egresos" },
  { to: "/providers", icon: Users, label: "Catálogo de Proveedores" },
  { to: "/calibration", icon: Sliders, label: "Ajustes de Cheque" },
]

const Sidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const displayName = user?.name || user?.email || "Usuario"

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/login"),
    })
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <AppLogo className="sidebar-brand-logo" />
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
          onClick={() => setShowLogoutModal(true)}
          style={{ justifyContent: "center", gap: "7px" }}
        >
          <LogOut size={15} />
          Cerrar Sesión
        </button>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Desea cerrar la sesión del sistema? Deberá ingresar sus credenciales nuevamente para acceder."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        variant="danger"
        icon="logout"
        onConfirm={handleConfirmLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </aside>
  )
}

export default Sidebar

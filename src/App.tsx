import { Routes, Route, Navigate } from "react-router-dom"
import DesignSystemPage from "@/pages/DesignSystem"
import LoginPage from "@/pages/Login"
import EmissionPage from "@/pages/Emission"
import ProvidersPage from "@/pages/Providers"
import ComingSoon from "@/pages/ComingSoon"
import AuthGuard from "@/components/auth/AuthGuard"
import MainLayout from "@/components/layout/MainLayout"

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />

      {/* Protected Routes */}
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/emission" replace />} />
          <Route path="/emission" element={<EmissionPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route
            path="/calibration"
            element={<ComingSoon moduleName="Ajustes de Cheque" />}
          />
        </Route>
      </Route>

      {/* Catch-all to redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

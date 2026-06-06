import { Routes, Route, Navigate } from "react-router-dom"
import DesignSystemPage from "@/pages/DesignSystem"
import LoginPage from "@/pages/Login"
import DashboardPage from "@/pages/Dashboard"
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
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Route>

      {/* Catch-all to redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

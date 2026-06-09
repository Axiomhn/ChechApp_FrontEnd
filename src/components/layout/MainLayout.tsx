import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

const MainLayout = () => {
  return (
    <div className="app-shell app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <div className="module-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout

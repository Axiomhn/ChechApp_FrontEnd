import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

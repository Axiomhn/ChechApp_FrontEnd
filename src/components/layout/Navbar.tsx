import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow-sm px-12 py-4 flex justify-between items-center border-b">
      <div className="text-blue-900 text-2xl font-normal font-['Segoe_UI_Symbol']">
        Chech App
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <User className="w-5 h-5 text-black" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-black text-2xl font-normal font-['Segoe_UI_Symbol']">
            {user?.name || user?.role || 'Usuario'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 p-0 hover:bg-red-50 cursor-pointer"
          onClick={handleLogout}
        >
          <div className="w-full h-full flex items-center justify-center bg-red-600 rounded-sm">
            <LogOut className="w-5 h-5 text-white" />
          </div>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

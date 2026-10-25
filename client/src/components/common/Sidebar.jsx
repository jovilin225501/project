import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Truck,
  Award,
  User,
  ShieldAlert,
  Users,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/');
  };

  const residentNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/reports/new', label: 'Report Waste', icon: PlusCircle },
    { to: '/reports', label: 'My Reports', icon: FileText },
    { to: '/pickups', label: 'Pickup Requests', icon: Truck },
    { to: '/rewards', label: 'Rewards & Ranks', icon: Award },
    { to: '/profile', label: 'Account Profile', icon: User }
  ];

  const adminNav = [
    { to: '/admin', label: 'Analytics Overview', icon: LayoutDashboard },
    { to: '/admin/reports', label: 'Report Management', icon: ShieldAlert },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/dashboard', label: 'Resident View', icon: FileText }
  ];

  const links = isAdmin ? adminNav : residentNav;

  const content = (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        {/* User Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-700 text-white font-bold flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h4>
              <p className="text-xs text-slate-500 capitalize">{user?.role} Account</p>
            </div>
          </div>

          {!isAdmin && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Reward Balance:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {user?.points || 0} pts
              </span>
            </div>
          )}
        </div>

        {/* Section Heading */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {isAdmin ? 'Administrative Modules' : 'Resident Portal'}
          </p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard' || item.to === '/admin'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-700 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer action */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          ></div>
          <div className="relative w-72 max-w-[85%] bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-heading font-extrabold text-lg text-slate-900">
                Eco<span className="text-brand-600">Track</span>
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

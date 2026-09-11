import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  ShieldAlert, 
  History, 
  Settings, 
  LogOut, 
  Radio,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  activeIncidentId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeIncidentId }) => {
  const navigate = useNavigate();
  const { user, role, primaryJurisdiction, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const defaultIncidentId = user?.primaryJurisdictionId?.includes('tuni') ? 'inc-tuni-001' : 'inc-railway-001';
  const targetIncidentId = activeIncidentId || defaultIncidentId;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/risk-map', label: 'Risk Map', icon: Layers },
    { to: `/incidents/${targetIncidentId}`, label: 'Incident Response', icon: ShieldAlert },
    { to: '/risk-history', label: 'Risk History', icon: History },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-[#e2e8df] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-low border-b border-[#e2e8df]">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline text-lg font-bold text-primary tracking-tight truncate leading-tight">ClimateShield</span>
            <span className="font-body text-[11px] text-on-surface-variant truncate uppercase tracking-wider font-semibold">Urban Risk &amp; Resilience</span>
          </div>
        </div>

        {/* Section Title */}
        <div className="px-space-md py-space-sm">
          <span className="font-body text-[10px] text-outline uppercase tracking-widest font-bold">Command Center</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col px-space-xs gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-space-sm px-space-sm py-2 rounded transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Telemetry & Profile Section */}
      <div className="flex flex-col bg-surface-container-low border-t border-[#e2e8df]">
        {/* Telemetry Indicator */}
        <div className="px-space-md py-2 flex items-center justify-between border-b border-[#e2e8df]" title="Backend weather sync with Open-Meteo">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Weather Feed</span>
          </div>
          <span className="text-[11px] text-primary font-bold">Active (Open-Meteo)</span>
        </div>

        {/* Operations Setting / Action */}
        <div className="px-space-xs py-1 flex items-center justify-between">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 px-space-sm py-1.5 rounded text-xs text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>System Settings</span>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors mr-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="px-space-md py-space-sm flex items-center gap-space-sm bg-surface-container-lowest border-t border-[#e2e8df]">
          <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm border border-secondary/20 shrink-0">
            {user?.name ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'OP'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-on-surface font-bold truncate">{user?.name || 'Operations Officer'}</span>
            <span className="text-[10px] text-on-surface-variant truncate font-medium">
              {role === 'ADMIN' ? 'District Administrator' : 'District Operator'} • {primaryJurisdiction || 'Assigned District'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

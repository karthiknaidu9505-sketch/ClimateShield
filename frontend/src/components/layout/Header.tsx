import React, { useEffect, useState } from 'react';
import { MapPin, AlertTriangle, Bell, ShieldAlert, WifiOff } from 'lucide-react';
import { isOfflineMode } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  districtName?: string;
  sectorName?: string;
  alertText?: string;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  districtName,
  sectorName = 'Operations Sector',
  alertText = 'Rainfall Alert: Level 3 Convective Inundation',
  notificationCount = 3
}) => {
  const [offline, setOffline] = useState(false);
  const { user, primaryJurisdiction } = useAuth();

  const activeDistrict = districtName || primaryJurisdiction || 'Operations Command';

  useEffect(() => {
    isOfflineMode().then(setOffline);
  }, []);

  return (
    <header className="fixed top-0 left-72 right-0 bg-surface-container-lowest/95 backdrop-blur-xl z-40 border-b border-[#e2e8df] shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      {/* Offline demo banner */}
      {offline && (
        <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-1 flex items-center justify-center gap-2 text-amber-800 text-[11px] font-semibold">
          <WifiOff className="w-3 h-3 shrink-0" />
          <span>Demo Mode — running offline with mock data. Start the backend (<code className="font-mono bg-amber-100 px-1 rounded">npm run dev --prefix backend</code>) for live data.</span>
        </div>
      )}
      <div className="h-16 w-full px-margin-desktop flex items-center justify-between">
        {/* Left Section: Monitored Jurisdiction Selector & Active Warning */}
        <div className="flex items-center gap-space-md">
          {/* Location / District Badge */}
          <div className="flex items-center gap-2 bg-surface-container-low px-space-sm py-1.5 rounded border border-[#e2e8df]">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold text-on-surface">{activeDistrict}</span>
            <span className="text-xs text-outline">•</span>
            <span className="text-xs text-on-surface-variant font-medium">{sectorName}</span>
          </div>

          {/* Active Level 3 Alert Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed px-space-sm py-1.5 rounded border border-tertiary-fixed-dim/40 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-tertiary shrink-0 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wide">{alertText}</span>
          </div>
        </div>

        {/* Right Section: Notifications & Emergency Protocols */}
        <div className="flex items-center gap-space-sm">
          {/* Notification Button with Badge */}
          <button 
            type="button"
            className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            title="Active Incident Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-on-error font-bold text-[10px] shadow-sm">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Emergency Protocols Button */}
          <button
            type="button"
            className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary-container px-space-md py-1.5 rounded font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency Protocols</span>
          </button>

          {/* User Icon Badge */}
          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs flex items-center justify-center border border-secondary/30">
            {user?.name ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'OP'}
          </div>
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 pl-72 flex flex-col min-w-0">
        {/* Fixed Top Header */}
        <Header />

        {/* Dynamic Route Content */}
        <main className="w-full pt-16 flex-1 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

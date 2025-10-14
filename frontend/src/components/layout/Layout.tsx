import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {/* Page Content - Render nested routes */}
          <Outlet />

          {/* Footer */}
          <footer className="mt-auto border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-gray-600">
                  <p>&copy; {new Date().getFullYear()} Tsinghua University. All rights reserved.</p>
                </div>
                <div className="flex items-center space-x-6">
                  <a
                    href="/help"
                    className="text-sm text-gray-600 hover:text-[#5E2C91] transition-colors"
                  >
                    Help Center
                  </a>
                  <a
                    href="/privacy"
                    className="text-sm text-gray-600 hover:text-[#5E2C91] transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/terms"
                    className="text-sm text-gray-600 hover:text-[#5E2C91] transition-colors"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;

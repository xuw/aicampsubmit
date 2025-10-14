import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  nameKey: string;
  path: string;
  icon: JSX.Element;
  roles: string[];
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems: NavItem[] = [
    {
      nameKey: 'nav.dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      roles: ['student', 'ta', 'instructor', 'admin'],
    },
    {
      nameKey: 'nav.assignments',
      path: '/assignments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      roles: ['student', 'ta', 'instructor', 'admin'],
    },
    {
      nameKey: 'nav.mySubmissions',
      path: '/submissions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      roles: ['student'],
    },
    {
      nameKey: 'nav.createAssignment',
      path: '/assignments/create',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      roles: ['ta', 'instructor', 'admin'],
    },
    {
      nameKey: 'nav.allSubmissions',
      path: '/review',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      roles: ['ta', 'instructor', 'admin'],
    },
    {
      nameKey: 'nav.manageUsers',
      path: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      roles: ['admin'],
    },
  ];

  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-[#5E2C91] text-white shadow-lg hover:bg-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-40
          bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Collapse Toggle Button (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-[#5E2C91] text-white rounded-full items-center justify-center hover:bg-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-md"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="h-full overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#5E2C91] text-white shadow-md'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-[#5E2C91]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#5E2C91]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`ml-3 font-medium transition-all duration-300 ${
                        isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'
                      }`}
                    >
                      {t(item.nameKey)}
                    </span>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-300 rounded-r" />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {t(item.nameKey)}
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Info Section (when not collapsed) */}
          {!isCollapsed && user && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="px-4 py-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Logged in as</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Help Section */}
          {!isCollapsed && (
            <div className="mt-6 px-4">
              <a
                href="/help"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-[#5E2C91] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Help & Support</span>
              </a>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

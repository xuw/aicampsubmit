import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh-CN'>(
    user?.language || 'en'
  );
  const [updatingLanguage, setUpdatingLanguage] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Sync current language with user data and i18n
  useEffect(() => {
    if (user?.language) {
      setCurrentLanguage(user.language as 'en' | 'zh-CN');
      i18n.changeLanguage(user.language);
    }
  }, [user?.language, i18n]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyles = (role: string) => {
    const baseStyles = 'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide';

    switch (role) {
      case 'admin':
        return `${baseStyles} bg-red-100 text-red-800 border border-red-200`;
      case 'instructor':
        return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`;
      case 'ta':
        return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
      case 'student':
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getRoleDisplayName = (role: string) => {
    return t(`roles.${role}`, role);
  };

  const handleLanguageChange = async (lang: 'en' | 'zh-CN') => {
    if (updatingLanguage) return;

    setUpdatingLanguage(true);
    try {
      await updateUser({ language: lang });
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
      setIsLanguageMenuOpen(false);
    } catch (error) {
      console.error('Failed to update language:', error);
      alert('Failed to update language preference. Please try again.');
    } finally {
      setUpdatingLanguage(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="bg-[#5E2C91] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="group">
              <div className="bg-white rounded-lg p-2 shadow-md transition-all group-hover:shadow-lg group-hover:scale-105">
                <img
                  src="/ai-bootcamp-logo.svg"
                  alt="AI+ Bootcamp"
                  className="h-10"
                />
              </div>
            </Link>
          </div>

          {/* Right side menu items */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            {user && (
              <div className={getRoleBadgeStyles(user.role)}>
                {getRoleDisplayName(user.role)}
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label="Language switcher"
                aria-expanded={isLanguageMenuOpen}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">
                  {currentLanguage === 'en' ? 'EN' : '中文'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isLanguageMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Language Dropdown */}
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      currentLanguage === 'en'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('zh-CN')}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      currentLanguage === 'zh-CN'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    中文 (Chinese)
                  </button>
                </div>
              )}
            </div>

            {/* User Menu */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center text-purple-900 font-semibold text-sm">
                      {user.firstName.charAt(0).toUpperCase()}
                      {user.lastName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {t('common.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react';

export default function LoginPageExample() {
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const t = {
    en: {
      welcome: 'Welcome Back',
      subtitle: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember me',
      login: 'Sign In',
      noAccount: "Don't have an account?",
      register: 'Register',
      tagline: 'Innovating for an Intelligent Future',
      title: 'AI+ Bootcamp',
      subtitle2: 'Submission System'
    },
    zh: {
      welcome: '欢迎回来',
      subtitle: '登录您的账户',
      email: '邮箱',
      password: '密码',
      rememberMe: '记住我',
      login: '登录',
      noAccount: '还没有账户？',
      register: '注册',
      tagline: '智能未来，创新先行',
      title: 'AI交叉创新营',
      subtitle2: '作业提交系统'
    }
  };

  const currentLang = t[language as keyof typeof t];

  const handleSubmit = () => {
    console.log('Login attempt:', { email, password, rememberMe });
    alert('Login functionality would connect to backend API');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Brand Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-purple-900 to-purple-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          {/* Logo */}
          <div className="mb-8">
            <svg viewBox="0 0 80 80" className="w-32 h-32 mx-auto">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#8B5FB5'}} />
                  <stop offset="100%" style={{stopColor:'#ffffff'}} />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="12" fill="white" opacity="0.9"/>
              <circle cx="20" cy="25" r="6" fill="white" opacity="0.7"/>
              <circle cx="20" cy="55" r="6" fill="white" opacity="0.7"/>
              <circle cx="60" cy="25" r="6" fill="white" opacity="0.7"/>
              <circle cx="60" cy="55" r="6" fill="white" opacity="0.7"/>
              <line x1="40" y1="40" x2="20" y2="25" stroke="white" strokeWidth="2" opacity="0.5"/>
              <line x1="40" y1="40" x2="20" y2="55" stroke="white" strokeWidth="2" opacity="0.5"/>
              <line x1="40" y1="40" x2="60" y2="25" stroke="white" strokeWidth="2" opacity="0.5"/>
              <line x1="40" y1="40" x2="60" y2="55" stroke="white" strokeWidth="2" opacity="0.5"/>
              <circle cx="68" cy="20" r="10" fill="#60A5FA" opacity="0.3"/>
              <path d="M 68 15 L 68 25 M 63 20 L 73 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-2">
            {currentLang.title}
          </h1>
          <p className="text-xl text-purple-200 mb-4">
            {currentLang.subtitle2}
          </p>
          
          {/* Tagline */}
          <div className="mt-6 px-6 py-3 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
            <p className="text-lg font-medium">
              {currentLang.tagline}
            </p>
          </div>

          {/* Decorative elements */}
          <div className="mt-12 flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="w-2 h-2 rounded-full bg-white opacity-50"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Language Switcher */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {language === 'en' ? '中文' : 'English'}
              </span>
            </button>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 mb-3">
              <span className="text-white text-2xl font-bold">AI+</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{currentLang.title}</h2>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentLang.welcome}
            </h2>
            <p className="text-gray-600">
              {currentLang.subtitle}
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentLang.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentLang.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                {currentLang.rememberMe}
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {currentLang.login}
            </button>

            {/* Register Link */}
            <div className="text-center text-sm text-gray-600">
              {currentLang.noAccount}{' '}
              <a href="#register" className="text-purple-700 hover:text-purple-900 font-medium">
                {currentLang.register}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            © 2025 AI+ Bootcamp. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
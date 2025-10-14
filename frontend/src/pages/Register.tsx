import { useTranslation } from 'react-i18next';
import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

const Register: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.firstNameRequired');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('auth.firstNameTooShort');
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.lastNameRequired');
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('auth.lastNameTooShort');
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.passwordTooShort');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('auth.passwordWeak');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setGeneralError(
        err.response?.data?.message || t('auth.registerError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tsinghua-purple to-purple-800 flex items-center justify-center px-4 py-12 relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="px-3 py-2 bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm cursor-pointer"
        >
          <option value="zh-CN" className="text-gray-900">中文</option>
          <option value="en" className="text-gray-900">English</option>
        </select>
      </div>

      <div className="max-w-md w-full">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <svg
              className="w-10 h-10 text-tsinghua-purple"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.registerTitle')}</h1>
          <p className="text-purple-100">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error Message */}
            {generalError && (
              <div
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
                role="alert"
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{generalError}</p>
                </div>
              </div>
            )}

            {/* Name Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                label={t('auth.firstName')}
                placeholder={t('auth.firstNamePlaceholder')}
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                fullWidth
                disabled={isLoading}
                autoComplete="given-name"
                required
              />
              <Input
                type="text"
                name="lastName"
                label={t('auth.lastName')}
                placeholder={t('auth.lastNamePlaceholder')}
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                fullWidth
                disabled={isLoading}
                autoComplete="family-name"
                required
              />
            </div>

            {/* Email Input */}
            <Input
              type="email"
              name="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              fullWidth
              disabled={isLoading}
              autoComplete="email"
              required
              leftIcon={
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
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            {/* Password Input */}
            <Input
              type="password"
              name="password"
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText={
                !errors.password ? t('auth.passwordHelperText') : undefined
              }
              fullWidth
              disabled={isLoading}
              autoComplete="new-password"
              required
              leftIcon={
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            {/* Confirm Password Input */}
            <Input
              type="password"
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              fullWidth
              disabled={isLoading}
              autoComplete="new-password"
              required
              leftIcon={
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            {/* Register Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('auth.hasAccount')}
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-tsinghua-purple hover:text-tsinghua-purple-dark font-semibold transition-colors duration-200"
              >
                {t('auth.signInInstead')}
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-purple-100 text-sm">
            {t('auth.termsAgreement')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

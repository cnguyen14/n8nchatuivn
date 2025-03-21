import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, UserPlus } from 'lucide-react';
import Button from '../ui/Button';
import GlassMorphism from '../ui/GlassMorphism';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import Footer from '../ui/Footer';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '', confirmPassword: '' });
  
  const { signUp, loading, error } = useAuthStore();
  const { translate } = useLanguageStore();

  const validateForm = () => {
    const errors = { email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!email) {
      errors.email = translate('auth.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = translate('auth.emailInvalid');
      isValid = false;
    }

    if (!password) {
      errors.password = translate('auth.passwordRequired');
      isValid = false;
    } else if (password.length < 6) {
      errors.password = translate('auth.passwordMinLength');
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = translate('auth.confirmPasswordRequired');
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = translate('auth.passwordsDoNotMatch');
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await signUp(email, password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-slate-800 p-4">
      <div className="flex-1 flex items-center justify-center">
        <GlassMorphism 
          className="w-full max-w-md p-8 md:p-10 shadow-xl" 
          intensity="medium" 
          theme="dark"
          glowingBorder={true}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{translate('auth.signup')}</h2>
            <p className="text-gray-300">{translate('auth.signupSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="absolute top-4 right-4">
            <LanguageSwitcher variant="minimal" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                {translate('auth.email')} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-gray-900 text-white rounded-lg border ${
                    formErrors.email ? 'border-red-500' : 'border-gray-700'
                  } input-focus-glow`}
                  placeholder={translate('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                {translate('auth.password')} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-gray-900 text-white rounded-lg border ${
                    formErrors.password ? 'border-red-500' : 'border-gray-700'
                  } input-focus-glow`}
                  placeholder={translate('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                {translate('auth.confirmPassword')} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-gray-900 text-white rounded-lg border ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                  } input-focus-glow`}
                  placeholder={translate('auth.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={loading}
              leftIcon={<UserPlus size={18} />}
              className="py-3 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg btn-pulse"
            >
              {translate('auth.createAccount')}
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-300">
                {translate('auth.alreadyHaveAccount')}{' '}
                <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                  {translate('auth.login')}
                </Link>
              </p>
            </div>
          </form>
        </GlassMorphism>
      </div>
      <Footer className="bg-slate-800/30 backdrop-blur-sm" />
    </div>
  );
};

export default SignupForm;

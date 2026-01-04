'use client';
import { login } from '@/actions/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    if (result.error) {
      setError(result.error || 'Error al iniciar sesión');
      setIsLoading(false);
    } else {
      // Guardar token y usuario si están disponibles
      // Guardar accessToken para uso en SSE (ya que la cookie es HttpOnly)
      if (result.accessToken) {
        localStorage.setItem('token', result.accessToken);
      } else if (result.token) {
        // Fallback for old behavior/different backends
        localStorage.setItem('token', result.token);
      } else if (result.user && result.user.token) {
        localStorage.setItem('token', result.user.token);
      }

      setTimeout(() => {
        authLogin();
        router.push('/');
      }, 100);
    }
  };





  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-4">
      <div className="mx-auto w-full max-w-lg">
        <p className="text-2xl font-bold text-gray-900 mb-2 text-center">Estación 1888 - Iniciar Sesión</p>
        <div className="bg-white py-8 px-8 shadow-lg border border-gray-200 rounded-xl min-h-[500px] flex flex-col justify-center">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>



            <div >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-14 px-4 py-3 text-base font-medium text-white bg-[#0E592F] border border-transparent rounded-lg hover:bg-[#0B4A27] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E592F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

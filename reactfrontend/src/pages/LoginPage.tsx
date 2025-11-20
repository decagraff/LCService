import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    try {
      setLoading(true);
      const loggedInUser = await login(email, password);
      showToast('Inicio de sesión exitoso', 'success');

      // Redirigir según el rol del usuario
      if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'vendedor') {
        navigate('/vendedor/dashboard');
      } else if (loggedInUser.role === 'cliente') {
        navigate('/cliente/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark-secondary px-4 py-12">
      {/* Theme toggle button - top right */}
      <button
        className="fixed top-4 right-4 z-50 p-3 rounded-lg bg-white dark:bg-background-dark-tertiary shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-background-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Factory className="w-10 h-10 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">LC Service</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600 dark:text-gray-400">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                ¿No tienes una cuenta?{' '}
                <Link to="/auth/register" className="text-primary hover:underline font-medium">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, Moon, Sun } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre || !formData.email || !formData.password) {
      showToast('Por favor completa los campos obligatorios', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });

      showToast('Registro exitoso! Ahora puedes iniciar sesión', 'success');
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al registrarse', 'error');
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600 dark:text-gray-400">Regístrate para acceder al sistema de cotizaciones</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="nombre"
              label="Nombre Completo *"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
              fullWidth
            />

            <Input
              type="email"
              name="email"
              label="Correo Electrónico *"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />

            <Input
              type="password"
              name="password"
              label="Contraseña *"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirmar Contraseña *"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
            />

            <Input
              type="tel"
              name="telefono"
              label="Teléfono (Opcional)"
              placeholder="+51 987 654 321"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
            />

            <Input
              type="text"
              name="direccion"
              label="Dirección (Opcional)"
              placeholder="Ej: Av. Principal 123, Lima"
              value={formData.direccion}
              onChange={handleChange}
              fullWidth
            />

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                ¿Ya tienes una cuenta?{' '}
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

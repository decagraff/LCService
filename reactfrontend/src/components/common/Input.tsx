import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string; // Agregamos esta propiedad
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
    const inputStyles = `
      block px-4 py-2 text-base
      bg-white dark:bg-background-dark-tertiary
      text-gray-900 dark:text-gray-100
      border rounded-lg
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 dark:border-gray-600'
      }
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputStyles}
          autoComplete={props.type === 'password' ? 'new-password' : props.type === 'email' ? 'email' : undefined}
          {...props}
        />
        {/* Mostrar helperText si existe y no hay error */}
        {helperText && !error && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </span>
        )}
        {error && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
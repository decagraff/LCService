# LC Service - Frontend React TypeScript

Sistema de gestión de cotizaciones para LC Service desarrollado con React, TypeScript y Tailwind CSS.

## 🚀 Características

- ✅ React 19.2.0 + TypeScript
- ✅ Vite para desarrollo rápido
- ✅ Tailwind CSS para estilos
- ✅ React Router para navegación
- ✅ Axios para llamadas API
- ✅ Sistema de temas claro/oscuro
- ✅ Gestión de estado con Context API
- ✅ Autenticación basada en sesiones
- ✅ Carrito de compras funcional
- ✅ Catálogo de productos con filtros
- ✅ Sistema de notificaciones Toast
- ✅ Diseño responsive

## 📁 Estructura del Proyecto

```
reactfrontend/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── catalog/       # Componentes del catálogo
│   │   ├── common/        # Componentes comunes (Button, Input, etc.)
│   │   └── layout/        # Componentes de layout (Header, Footer)
│   ├── contexts/          # React Contexts (Auth, Cart, Theme, Toast)
│   ├── pages/             # Páginas principales
│   ├── services/          # Servicios de API
│   ├── types/             # Definiciones TypeScript
│   ├── App.tsx            # Componente principal
│   ├── App.css            # Estilos principales
│   └── index.css          # Estilos base + Tailwind
├── .env.development       # Variables de entorno (desarrollo)
├── .env.example           # Ejemplo de variables de entorno
└── index.html             # HTML principal
```

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias

```bash
cd reactfrontend
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Compila para producción
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## 🎨 Sistema de Temas

El proyecto incluye soporte para tema claro y oscuro. El tema se puede cambiar haciendo clic en el botón 🌙 en el header.

## 🔐 Autenticación

El sistema usa autenticación basada en sesiones con cookies:

- **Login:** `/auth/login`
- **Roles:** admin, vendedor, cliente

## 🛒 Funcionalidades Implementadas

### ✅ Catálogo de Productos
- Visualización en grid o lista
- Filtros por categoría, precio y búsqueda
- Carrito de compras lateral
- Agregar/quitar productos

### ✅ Dashboard
- Acciones rápidas según rol
- Estadísticas

### ✅ Login
- Formulario de inicio de sesión
- Redirección automática según rol

## 🌐 URLs

- **Desarrollo:** http://localhost:5173
- **Producción:** https://lc-service.decatron.net/

---

**Desarrollado para LC Service - 2025**

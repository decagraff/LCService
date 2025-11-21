# LC Service - Sistema Web de Gestión de Cotizaciones

Sistema web para la gestión integral de cotizaciones en la empresa LC Service, especializada en fabricación y mantenimiento de equipos gastronómicos de acero inoxidable.

## Descripción

Plataforma web desarrollada como proyecto de investigación para optimizar el proceso de cotizaciones mediante transformación digital. El sistema reemplaza los métodos manuales (Excel, documentos dispersos) por una solución centralizada y accesible.

## Stack Tecnológico

### Frontend
- **React 18** - Librería de interfaces de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool y dev server
- **React Router v6** - Navegación SPA
- **Recharts** - Visualización de datos

### Backend
- **Node.js 20** - Runtime de JavaScript
- **Express.js** - Framework HTTP
- **MySQL** - Base de datos relacional
- **Express-Session** - Manejo de sesiones
- **Bcrypt** - Hash de contraseñas

### Inteligencia Artificial
- **Google Gemini API** - Asistente virtual con function calling

## Estructura del Proyecto

```
LCService/
├── backend/
│   ├── config/          # Configuración de BD y app
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Auth, validación
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de endpoints
│   └── server.js        # Punto de entrada
├── reactfrontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── contexts/    # Estado global (Auth, Cart, Theme)
│   │   ├── pages/       # Vistas principales
│   │   ├── services/    # Llamadas a API
│   │   └── types/       # Definiciones TypeScript
│   └── vite.config.ts
├── docs/                # Documentación de tesis
└── README.md
```

## Instalación

### Requisitos
- Node.js >= 18.x
- MySQL >= 8.0
- npm o yarn

### Configuración

1. **Clonar repositorio**
```bash
git clone https://github.com/decagraff/LCService.git
cd LCService
```

2. **Variables de entorno**
```bash
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lc_service
SESSION_SECRET=your_secret
GEMINI_API_KEY=your_api_key
```

3. **Instalar dependencias**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../reactfrontend && npm install
```

4. **Iniciar servicios**
```bash
# Backend (puerto 3005)
cd backend && npm run dev

# Frontend (puerto 5190)
cd reactfrontend && npm run dev
```

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/auth/change-password` | Cambiar contraseña |

### Cotizaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/{role}/api/cotizaciones` | Listar cotizaciones |
| GET | `/{role}/api/cotizaciones/:id` | Detalle de cotización |
| POST | `/{role}/api/cotizaciones/nueva` | Crear cotización |
| PUT | `/{role}/api/cotizaciones/:id/estado` | Actualizar estado |

### Catálogo
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/{role}/api/catalogo` | Listar equipos |
| GET | `/{role}/api/categorias` | Listar categorías |
| GET | `/{role}/api/catalogo/:id` | Detalle de equipo |

## Roles y Permisos

| Funcionalidad | Cliente | Vendedor | Admin |
|---------------|:-------:|:--------:|:-----:|
| Ver catálogo | ✓ | ✓ | ✓ |
| Crear cotización | ✓ | ✓ | ✓ |
| Ver cotizaciones propias | ✓ | ✓ | ✓ |
| Ver todas las cotizaciones | - | - | ✓ |
| Gestionar inventario | - | - | ✓ |
| Gestionar usuarios | - | - | ✓ |
| Reportes avanzados | - | ✓ | ✓ |

## Base de Datos

### Tablas principales
- `users` - Usuarios del sistema
- `cotizaciones` - Cabecera de cotizaciones
- `cotizacion_detalles` - Items de cotización
- `equipos` - Catálogo de productos
- `categorias` - Clasificación de equipos

## Despliegue

### Producción (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name lc-service.decatron.net;

    location /api {
        proxy_pass http://localhost:3005;
    }

    location / {
        proxy_pass http://localhost:5190;
    }
}
```

### PM2
```bash
# Backend
pm2 start backend/server.js --name "lc-backend"

# Frontend (build estático)
cd reactfrontend && npm run build
```

## Documentación

La documentación completa de la tesis se encuentra en [`/docs`](./docs/README.md):

- [Introducción](./docs/01-introduccion.md)
- [Planteamiento del Problema](./docs/02-planteamiento-problema/README.md)
- [Marco Teórico](./docs/03-marco-teorico/README.md)
- [Metodología](./docs/04-metodologia/README.md)
- [El Sistema](./docs/05-sistema/README.md)
- [Resultados](./docs/06-resultados.md)

## Autores

- **Anthony Adrian Chaparro Salas**
- **Miriam Fatima Saenz Valdiviezo**

**Asesor**: Mg. Elvis Adan Visa Ramirez

## Licencia

Este proyecto es parte de un trabajo de investigación académica.

---

Universidad - Lima, Perú - 2025

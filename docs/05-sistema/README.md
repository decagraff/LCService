# IV. El Sistema Web

[← Metodología](../04-metodologia/README.md) | [Índice](../README.md) | [Resultados →](../06-resultados.md)

---

## Contenido del Capítulo

| Sección | Descripción |
|---------|-------------|
| [4.1 Arquitectura](#41-arquitectura-del-sistema) | Diseño técnico |
| [4.2 Tecnologías](#42-stack-tecnológico) | Herramientas utilizadas |
| [4.3 Base de Datos](#43-modelo-de-datos) | Estructura de información |
| [4.4 Módulos](#44-módulos-del-sistema) | Funcionalidades |
| [4.5 Interfaces](#45-interfaces-de-usuario) | Pantallas principales |

---

## 4.1 Arquitectura del Sistema

### Arquitectura de 3 Capas

```mermaid
flowchart TB
    subgraph cliente["🖥️ CAPA DE PRESENTACIÓN"]
        direction LR
        B1["🌐 Navegador Web"]
        B2["📱 Responsive"]
    end

    subgraph servidor["⚙️ CAPA DE LÓGICA DE NEGOCIO"]
        direction TB
        S1["🔐 Autenticación"]
        S2["📋 Cotizaciones"]
        S3["📦 Inventario"]
        S4["👥 Usuarios"]
        S5["🤖 Chat IA"]
    end

    subgraph datos["🗄️ CAPA DE DATOS"]
        direction LR
        DB[("MySQL<br/>Database")]
    end

    cliente <-->|"HTTPS/REST API"| servidor
    servidor <-->|"SQL Queries"| datos

    style cliente fill:#61dafb,stroke:#20232a,color:#20232a
    style servidor fill:#68a063,stroke:#3c873a,color:#fff
    style datos fill:#00758f,stroke:#f29111,color:#fff
```

### Arquitectura de Despliegue

```mermaid
flowchart LR
    subgraph internet["🌐 INTERNET"]
        USER["👤 Usuario"]
    end

    subgraph servidor["☁️ SERVIDOR"]
        NGINX["Nginx<br/>Reverse Proxy"]
        FE["Vite<br/>:5190"]
        BE["Node.js<br/>:3005"]
        DB[("MySQL<br/>:3306")]
    end

    USER -->|HTTPS:443| NGINX
    NGINX -->|/| FE
    NGINX -->|/api/*| BE
    BE --> DB

    style internet fill:#3498db,stroke:#2980b9,color:#fff
    style servidor fill:#2c3e50,stroke:#34495e,color:#fff
```

---

## 4.2 Stack Tecnológico

### Frontend

```mermaid
graph TB
    subgraph frontend["🎨 FRONTEND STACK"]
        direction TB
        R["⚛️ React 18"]
        TS["📘 TypeScript"]
        TW["🎨 Tailwind CSS"]
        V["⚡ Vite"]
        RR["🔀 React Router"]
        RC["📊 Recharts"]
        LU["🔷 Lucide Icons"]
    end

    R --> TS
    TS --> TW
    TW --> V

    style frontend fill:#20232a,stroke:#61dafb,color:#61dafb
```

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.x | Librería UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.x | Estilos utilitarios |
| Vite | 5.x | Build tool |
| React Router | 6.x | Navegación SPA |
| Recharts | 2.x | Gráficos y reportes |

### Backend

```mermaid
graph TB
    subgraph backend["⚙️ BACKEND STACK"]
        direction TB
        N["🟢 Node.js"]
        E["🚂 Express.js"]
        M2["🐬 MySQL2"]
        BC["🔐 Bcrypt"]
        ES["📦 Express-Session"]
    end

    N --> E
    E --> M2
    E --> BC
    E --> ES

    style backend fill:#3c873a,stroke:#68a063,color:#fff
```

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20.x | Runtime JavaScript |
| Express | 4.x | Framework HTTP |
| MySQL2 | 3.x | Driver de BD |
| Bcrypt | 5.x | Hash de contraseñas |
| Express-Session | 1.x | Manejo de sesiones |

### Inteligencia Artificial

```mermaid
graph LR
    subgraph ai["🤖 INTEGRACIÓN IA"]
        CHAT["💬 Chat<br/>Asistente"]
        GEMINI["🔮 Google<br/>Gemini API"]
        TOOLS["🔧 Function<br/>Calling"]
    end

    CHAT --> GEMINI
    GEMINI --> TOOLS
    TOOLS -->|Búsqueda| DB[("BD")]
    TOOLS -->|Cotización| COT["📋"]

    style ai fill:#8e44ad,stroke:#9b59b6,color:#fff
```

---

## 4.3 Modelo de Datos

### Diagrama Entidad-Relación

```mermaid
erDiagram
    USERS ||--o{ COTIZACIONES : "crea"
    USERS {
        int id PK
        string email UK
        string password
        string nombre
        string apellido
        enum role
        string telefono
        string empresa
        enum estado
        datetime created_at
    }

    COTIZACIONES ||--|{ COTIZACION_DETALLES : "contiene"
    COTIZACIONES {
        int id PK
        string numero_cotizacion UK
        int cliente_id FK
        int vendedor_id FK
        enum estado
        decimal subtotal
        decimal igv
        decimal total
        text notas
        datetime created_at
    }

    EQUIPOS ||--o{ COTIZACION_DETALLES : "incluido_en"
    EQUIPOS {
        int id PK
        string codigo UK
        string nombre
        text descripcion
        decimal precio
        int stock
        int categoria_id FK
        string imagen_url
        enum estado
    }

    CATEGORIAS ||--o{ EQUIPOS : "clasifica"
    CATEGORIAS {
        int id PK
        string nombre
        text descripcion
        enum estado
    }

    COTIZACION_DETALLES {
        int id PK
        int cotizacion_id FK
        int equipo_id FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }
```

### Relaciones Principales

| Tabla | Relación | Tabla |
|-------|----------|-------|
| users | 1:N | cotizaciones (como cliente) |
| users | 1:N | cotizaciones (como vendedor) |
| cotizaciones | 1:N | cotizacion_detalles |
| equipos | 1:N | cotizacion_detalles |
| categorias | 1:N | equipos |

---

## 4.4 Módulos del Sistema

### Mapa de Módulos

```mermaid
flowchart TB
    subgraph sistema["💻 SISTEMA WEB LC SERVICE"]
        direction TB

        subgraph auth["🔐 AUTENTICACIÓN"]
            A1["Login"]
            A2["Registro"]
            A3["Sesiones"]
        end

        subgraph roles["👥 ROLES"]
            R1["👤 Cliente"]
            R2["👔 Vendedor"]
            R3["⚙️ Admin"]
        end

        subgraph modulos["📦 MÓDULOS"]
            M1["📊 Dashboard"]
            M2["📋 Cotizaciones"]
            M3["📦 Catálogo"]
            M4["🛒 Carrito"]
            M5["📈 Reportes"]
            M6["👥 Usuarios"]
            M7["💬 Chat IA"]
        end
    end

    auth --> roles
    roles --> modulos

    style sistema fill:#2c3e50,stroke:#34495e,color:#fff
    style auth fill:#e74c3c,stroke:#c0392b,color:#fff
    style roles fill:#3498db,stroke:#2980b9,color:#fff
    style modulos fill:#27ae60,stroke:#1e8449,color:#fff
```

### Matriz de Permisos por Rol

| Módulo | Cliente | Vendedor | Admin |
|--------|:-------:|:--------:|:-----:|
| Dashboard | ✅ | ✅ | ✅ |
| Ver Catálogo | ✅ | ✅ | ✅ |
| Crear Cotización | ✅ | ✅ | ✅ |
| Ver Mis Cotizaciones | ✅ | ✅ | ✅ |
| Ver Todas las Cotizaciones | ❌ | ❌ | ✅ |
| Gestionar Inventario | ❌ | ❌ | ✅ |
| Gestionar Usuarios | ❌ | ❌ | ✅ |
| Reportes Avanzados | ❌ | ✅ | ✅ |
| Chat IA | ✅ | ✅ | ✅ |

---

## 4.5 Interfaces de Usuario

### Flujo de Usuario

```mermaid
journey
    title Flujo de Creación de Cotización
    section Ingreso
      Login: 5: Cliente
      Ver Dashboard: 4: Cliente
    section Exploración
      Navegar Catálogo: 5: Cliente
      Filtrar Productos: 4: Cliente
      Ver Detalles: 5: Cliente
    section Cotización
      Agregar al Carrito: 5: Cliente
      Revisar Carrito: 4: Cliente
      Generar Cotización: 5: Cliente
    section Seguimiento
      Ver Estado: 4: Cliente
      Descargar PDF: 5: Cliente
```

### Pantallas Principales

| Pantalla | Descripción | Rol |
|----------|-------------|-----|
| Login | Autenticación de usuarios | Todos |
| Dashboard | Panel principal con KPIs | Todos |
| Catálogo | Lista de productos con filtros | Todos |
| Carrito | Productos seleccionados | Cliente/Vendedor |
| Nueva Cotización | Formulario de cotización | Cliente/Vendedor |
| Mis Cotizaciones | Lista de cotizaciones propias | Todos |
| Reportes | Gráficos y estadísticas | Admin |
| Chat IA | Asistente virtual Decatron | Todos |

---

## Recursos Adicionales

- [Arquitectura Detallada](./arquitectura.md)
- [Manual de Usuario](./manual-usuario.md)
- [API Reference](./api-reference.md)

---

<div align="center">

[← Metodología](../04-metodologia/README.md) | [Índice](../README.md) | [**Resultados →**](../06-resultados.md)

</div>

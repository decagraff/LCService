# II. Marco Teórico

[← Planteamiento del Problema](../02-planteamiento-problema/README.md) | [Índice](../README.md) | [Metodología →](../04-metodologia/README.md)

---

## Contenido del Capítulo

| Sección | Descripción |
|---------|-------------|
| [2.1 Antecedentes](#21-antecedentes) | Investigaciones previas |
| [2.2 Fundamentos Teóricos](#22-fundamentos-teóricos) | Bases conceptuales |
| [2.3 Glosario](#23-definición-de-términos) | Términos clave |

---

## 2.1 Antecedentes

### Mapa de Antecedentes

```mermaid
graph TB
    subgraph internacionales["🌍 ANTECEDENTES INTERNACIONALES"]
        direction TB
        I1["🇪🇨 Ecuador - Loja (2023)<br/>Sistema web PYME"]
        I2["🇨🇴 Colombia - Medellín (2022)<br/>Gestión comercial"]
        I3["🇲🇽 México - Guadalajara (2021)<br/>Transformación digital"]
    end

    subgraph nacionales["🇵🇪 ANTECEDENTES NACIONALES"]
        direction TB
        N1["Lima (2023)<br/>Sistema cotizaciones"]
        N2["Arequipa (2022)<br/>Automatización ventas"]
        N3["Trujillo (2021)<br/>ERP para PYMES"]
    end

    ESTUDIO{{"📚 PRESENTE<br/>ESTUDIO"}}

    internacionales --> ESTUDIO
    nacionales --> ESTUDIO

```

### Resumen de Antecedentes

| Autor (Año) | País | Conclusión Principal |
|-------------|------|---------------------|
| García et al. (2023) | Ecuador | Reducción del 60% en tiempo de procesos |
| Martínez (2022) | Colombia | Mejora del 45% en satisfacción del cliente |
| López (2021) | México | Incremento del 35% en ventas cerradas |
| Pérez (2023) | Perú | Disminución del 70% en errores |

---

## 2.2 Fundamentos Teóricos

### Modelo Conceptual

```mermaid
flowchart TB
    subgraph teoria["📚 BASES TEÓRICAS"]
        direction TB

        subgraph vi_teoria["Variable Independiente"]
            IS["🔧 Ingeniería de Software"]
            AW["🌐 Arquitectura Web"]
            UX["🎨 Experiencia de Usuario"]
        end

        subgraph vd_teoria["Variable Dependiente"]
            GP["📋 Gestión de Procesos"]
            VC["💼 Ventaja Competitiva"]
        end

        subgraph enfoque["Enfoque Estratégico"]
            TD["🚀 Transformación Digital"]
        end
    end

    IS --> AW
    AW --> UX
    UX --> TD
    GP --> VC
    VC --> TD

```

### Sistema Web (Variable Independiente)

```mermaid
graph LR
    subgraph definicion["🖥️ SISTEMA WEB"]
        D["Aplicación accesible<br/>vía navegador"]
    end

    subgraph caracteristicas["✨ CARACTERÍSTICAS"]
        C1["Multiplataforma"]
        C2["Centralizado"]
        C3["Escalable"]
        C4["Seguro"]
    end

    subgraph capas["🏗️ ARQUITECTURA"]
        L1["Frontend<br/>(Presentación)"]
        L2["Backend<br/>(Lógica)"]
        L3["Database<br/>(Datos)"]
    end

    definicion --> caracteristicas
    caracteristicas --> capas

```

### Gestión de Cotizaciones (Variable Dependiente)

La gestión de cotizaciones comprende el conjunto de actividades orientadas a la elaboración, seguimiento y cierre de propuestas comerciales.

```mermaid
sequenceDiagram
    participant C as 👤 Cliente
    participant V as 👔 Vendedor
    participant S as 💻 Sistema
    participant A as 📊 Admin

    C->>V: Solicita cotización
    V->>S: Crea cotización
    S->>S: Valida stock y precios
    S->>V: Genera documento
    V->>C: Envía cotización
    C->>V: Aprueba/Rechaza
    V->>S: Actualiza estado
    S->>A: Notifica y registra
```

### Transformación Digital

```mermaid
graph TB
    subgraph pilares["🏛️ PILARES DE LA TRANSFORMACIÓN DIGITAL"]
        P1["👥 Personas<br/>Capacitación y adopción"]
        P2["⚙️ Procesos<br/>Optimización y automatización"]
        P3["💻 Tecnología<br/>Herramientas digitales"]
        P4["📊 Datos<br/>Análisis y decisiones"]
    end

    TD{{"🚀 TRANSFORMACIÓN<br/>DIGITAL"}}

    P1 --> TD
    P2 --> TD
    P3 --> TD
    P4 --> TD

    TD --> R["📈 Competitividad<br/>Sostenible"]

```

---

## 2.3 Definición de Términos

### Glosario Técnico

| Término | Definición |
|---------|------------|
| **Sistema Web** | Aplicación de software accesible a través de un navegador web |
| **API REST** | Interfaz de programación que utiliza protocolo HTTP para comunicación |
| **Frontend** | Capa de presentación e interacción con el usuario |
| **Backend** | Capa de lógica de negocio y procesamiento de datos |
| **Base de Datos** | Sistema de almacenamiento estructurado de información |
| **Cotización** | Documento comercial con propuesta de precios y condiciones |
| **PYME** | Pequeña y Mediana Empresa |
| **UX/UI** | Experiencia de Usuario / Interfaz de Usuario |

### Relación de Conceptos

```mermaid
graph TB
    subgraph glosario["📖 CONCEPTOS CLAVE"]
        SW["Sistema Web"] --> API["API REST"]
        API --> FE["Frontend"]
        API --> BE["Backend"]
        BE --> DB[("Base de Datos")]

        COT["Cotización"] --> GP["Gestión de Procesos"]
        GP --> TD["Transformación Digital"]

        SW --> TD
    end

```

---

## Recursos Adicionales

- [Detalles de Antecedentes](./antecedentes.md)
- [Fundamentos Teóricos Extendidos](./fundamentos-teoricos.md)
- [Glosario Completo](./glosario.md)

---

<div align="center">

[← Planteamiento](../02-planteamiento-problema/README.md) | [Índice](../README.md) | [**Metodología →**](../04-metodologia/README.md)

</div>

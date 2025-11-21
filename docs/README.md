# Sistema Web LC Service

> **Implementación de un sistema web para optimizar la gestión de cotizaciones con enfoque en transformación digital en la empresa LC Service**

## Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Institución** | Universidad |
| **Grado** | Bachiller en Tecnología de la Información |
| **Autores** | Anthony Adrian Chaparro Salas, Miriam Fatima Saenz Valdiviezo |
| **Asesor** | Mg. Elvis Adan Visa Ramirez |
| **Año** | 2025 |

---

## Navegación del Documento

```mermaid
flowchart TB
    subgraph docs["📚 DOCUMENTACIÓN DE TESIS"]
        direction TB

        intro["📖 Introducción"]

        subgraph cap1["I. PLANTEAMIENTO DEL PROBLEMA"]
            prob["🔍 Realidad Problemática"]
            form["❓ Formulación"]
            just["✅ Justificación"]
            obj["🎯 Objetivos"]
            hip["💡 Hipótesis"]
            vars["📊 Variables"]
        end

        subgraph cap2["II. MARCO TEÓRICO"]
            ant["📜 Antecedentes"]
            fund["📚 Fundamentos"]
            glos["📝 Glosario"]
        end

        subgraph cap3["III. METODOLOGÍA"]
            tipo["🔬 Tipo y Diseño"]
            pob["👥 Población"]
            anal["📈 Análisis"]
        end

        subgraph cap4["IV. EL SISTEMA"]
            arq["🏗️ Arquitectura"]
            tech["⚙️ Tecnologías"]
            func["🖥️ Funcionalidades"]
        end

        ref["📚 Referencias"]
    end

    intro --> cap1
    cap1 --> cap2
    cap2 --> cap3
    cap3 --> cap4
    cap4 --> ref

    style docs fill:#1a1a2e,stroke:#16213e,color:#fff
    style cap1 fill:#0f3460,stroke:#e94560,color:#fff
    style cap2 fill:#0f3460,stroke:#e94560,color:#fff
    style cap3 fill:#0f3460,stroke:#e94560,color:#fff
    style cap4 fill:#0f3460,stroke:#e94560,color:#fff
```

---

## Índice de Contenidos

### Parte I: Fundamentos de la Investigación

| # | Sección | Descripción |
|---|---------|-------------|
| 1 | [Introducción](./01-introduccion.md) | Contexto y motivación del proyecto |
| 2 | [Planteamiento del Problema](./02-planteamiento-problema/README.md) | Análisis de la problemática |
| 3 | [Marco Teórico](./03-marco-teorico/README.md) | Bases teóricas y antecedentes |
| 4 | [Metodología](./04-metodologia/README.md) | Diseño de la investigación |

### Parte II: Desarrollo del Sistema

| # | Sección | Descripción |
|---|---------|-------------|
| 5 | [El Sistema](./05-sistema/README.md) | Arquitectura y desarrollo |
| 6 | [Resultados](./06-resultados.md) | Análisis pre-test y post-test |
| 7 | [Referencias](./07-referencias.md) | Bibliografía utilizada |

---

## Resumen Ejecutivo

```mermaid
graph LR
    subgraph ANTES["❌ ANTES"]
        A1(("Excel<br/>disperso"))
        A2(("Errores<br/>manuales"))
        A3(("Sin<br/>trazabilidad"))
    end

    subgraph SISTEMA["🚀 SISTEMA WEB"]
        S1[/"React +<br/>Node.js"/]
        S2[("MySQL<br/>Database")]
        S3{{"API<br/>REST"}}
    end

    subgraph DESPUES["✅ DESPUÉS"]
        D1(("Centralizado"))
        D2(("Automatizado"))
        D3(("Reportes<br/>en tiempo real"))
    end

    ANTES -->|Transformación<br/>Digital| SISTEMA
    SISTEMA -->|Resultados| DESPUES

    style ANTES fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style SISTEMA fill:#4dabf7,stroke:#1971c2,color:#fff
    style DESPUES fill:#51cf66,stroke:#2f9e44,color:#fff
```

---

## Variables de Investigación

| Variable | Tipo | Dimensiones |
|----------|------|-------------|
| **Sistema Web** | Independiente | Usabilidad, Funcionalidad, Fiabilidad |
| **Gestión de Cotizaciones** | Dependiente | Tiempo, Precisión, Satisfacción |

---

## Stack Tecnológico

```mermaid
graph TB
    subgraph Frontend["🎨 FRONTEND"]
        R[React 18]
        TS[TypeScript]
        TW[Tailwind CSS]
        V[Vite]
    end

    subgraph Backend["⚙️ BACKEND"]
        N[Node.js]
        E[Express]
        J[JWT Auth]
    end

    subgraph Database["🗄️ DATABASE"]
        M[(MySQL)]
    end

    subgraph AI["🤖 AI"]
        G[Gemini API]
    end

    Frontend <-->|REST API| Backend
    Backend <-->|Queries| Database
    Backend <-->|Chat| AI

    style Frontend fill:#61dafb,stroke:#20232a,color:#20232a
    style Backend fill:#68a063,stroke:#3c873a,color:#fff
    style Database fill:#00758f,stroke:#f29111,color:#fff
    style AI fill:#8e44ad,stroke:#9b59b6,color:#fff
```

---

## Contacto

- **Repositorio**: [LCService](https://github.com/decagraff/LCService)
- **Demo**: [lc-service.decatron.net](https://lc-service.decatron.net)

---

<div align="center">

**[Comenzar Lectura →](./01-introduccion.md)**

</div>

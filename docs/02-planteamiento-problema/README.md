# I. Planteamiento del Problema

[← Introducción](../01-introduccion.md) | [Índice](../README.md) | [Marco Teórico →](../03-marco-teorico/README.md)

---

## Contenido del Capítulo

| Sección | Descripción |
|---------|-------------|
| [1.1 Realidad Problemática](#11-realidad-problemática) | Diagnóstico de la situación actual |
| [1.2 Formulación del Problema](#12-formulación-del-problema) | Preguntas de investigación |
| [1.3 Justificación](#13-justificación-e-importancia) | Razones del estudio |
| [1.4 Objetivos](#14-objetivos) | General y específicos |
| [1.5 Hipótesis](#15-hipótesis) | Planteamientos a demostrar |
| [1.6 Variables](#16-variables) | Operacionalización |

---

## 1.1 Realidad Problemática

### Diagnóstico del Proceso Actual

```mermaid
flowchart TD
    subgraph proceso["⚙️ PROCESO ACTUAL DE COTIZACIÓN"]
        direction TB

        A["📞 Cliente solicita<br/>cotización"] --> B["📝 Vendedor recibe<br/>solicitud"]
        B --> C{"¿Tiene datos<br/>del producto?"}
        C -->|No| D["🔍 Buscar en<br/>archivos Excel"]
        C -->|Sí| E["📄 Crear cotización<br/>manualmente"]
        D --> E
        E --> F["📧 Enviar por<br/>email/WhatsApp"]
        F --> G{"¿Cliente<br/>responde?"}
        G -->|No| H["⏳ Esperar y<br/>hacer seguimiento"]
        G -->|Sí| I["✅ Procesar<br/>pedido"]
        H --> G
    end

```

### Problemas Identificados

```mermaid
graph TB
    subgraph problemas["🔴 PROBLEMAS DETECTADOS"]
        direction TB

        P1["⏱️ Demoras en<br/>respuesta"]
        P2["❌ Errores de<br/>transcripción"]
        P3["📂 Información<br/>dispersa"]
        P4["📉 Pérdida de<br/>clientes"]
        P5["🔄 Procesos<br/>repetitivos"]
    end

    CAUSA{{"Falta de<br/>Sistema Digital"}}

    CAUSA --> P1
    CAUSA --> P2
    CAUSA --> P3
    CAUSA --> P4
    CAUSA --> P5

```

### Indicadores Críticos

| Indicador | Situación Actual | Impacto |
|-----------|-----------------|---------|
| Tiempo promedio por cotización | 45-60 minutos | Alto |
| Tasa de errores | 15-20% | Alto |
| Cotizaciones perdidas | ~30% sin seguimiento | Crítico |
| Satisfacción del cliente | Baja | Alto |

---

## 1.2 Formulación del Problema

### Problema General

> **¿De qué manera la implementación de un sistema web optimiza la gestión de cotizaciones con enfoque en transformación digital en la empresa LC Service?**

### Problemas Específicos

```mermaid
mindmap
  root((Problema<br/>General))
    PE1
      ¿Cómo influye el sistema web en el tiempo de elaboración?
    PE2
      ¿Cómo influye el sistema web en la precisión de los datos?
    PE3
      ¿Cómo influye el sistema web en la satisfacción del cliente?
```

| # | Problema Específico |
|---|---------------------|
| PE1 | ¿De qué manera el sistema web reduce el **tiempo de elaboración** de cotizaciones? |
| PE2 | ¿De qué manera el sistema web mejora la **precisión de los datos** en las cotizaciones? |
| PE3 | ¿De qué manera el sistema web incrementa la **satisfacción del cliente**? |

---

## 1.3 Justificación e Importancia

### Justificación Teórica

El estudio aporta conocimiento sobre la aplicación de tecnologías web en procesos comerciales de PYMES del sector gastronómico.

### Justificación Práctica

```mermaid
graph LR
    subgraph justificacion["✅ JUSTIFICACIÓN PRÁCTICA"]
        J1["💰 Reducción<br/>de costos"]
        J2["⚡ Mayor<br/>eficiencia"]
        J3["🎯 Mejor<br/>servicio"]
        J4["📊 Datos para<br/>decisiones"]
    end

    SISTEMA[("🖥️ Sistema<br/>Web")]

    SISTEMA --> J1
    SISTEMA --> J2
    SISTEMA --> J3
    SISTEMA --> J4

```

### Justificación Metodológica

Se valida un instrumento de medición para evaluar sistemas web en gestión de cotizaciones.

---

## 1.4 Objetivos

### Objetivo General

> **Implementar un sistema web para optimizar la gestión de cotizaciones con enfoque en transformación digital en la empresa LC Service.**

### Objetivos Específicos

```mermaid
graph TB
    OG{{"🎯 OBJETIVO<br/>GENERAL"}}

    OE1["OE1: Reducir tiempo<br/>de elaboración"]
    OE2["OE2: Mejorar precisión<br/>de datos"]
    OE3["OE3: Incrementar<br/>satisfacción del cliente"]

    OG --> OE1
    OG --> OE2
    OG --> OE3

    OE1 --> R1["📉 De 45min a 10min"]
    OE2 --> R2["📈 Error < 5%"]
    OE3 --> R3["⭐ Satisfacción > 80%"]

```

---

## 1.5 Hipótesis

### Hipótesis General

> **La implementación del sistema web optimiza significativamente la gestión de cotizaciones con enfoque en transformación digital en la empresa LC Service.**

### Hipótesis Específicas

| # | Hipótesis |
|---|-----------|
| HE1 | El sistema web **reduce significativamente** el tiempo de elaboración de cotizaciones |
| HE2 | El sistema web **mejora significativamente** la precisión de los datos |
| HE3 | El sistema web **incrementa significativamente** la satisfacción del cliente |

---

## 1.6 Variables

### Operacionalización de Variables

```mermaid
graph TB
    subgraph vi["📊 VARIABLE INDEPENDIENTE"]
        VI["Sistema Web"]
        VI --> D1["Usabilidad"]
        VI --> D2["Funcionalidad"]
        VI --> D3["Fiabilidad"]
    end

    subgraph vd["📈 VARIABLE DEPENDIENTE"]
        VD["Gestión de<br/>Cotizaciones"]
        VD --> D4["Tiempo de elaboración"]
        VD --> D5["Precisión de datos"]
        VD --> D6["Satisfacción del cliente"]
    end

    vi -->|"Influye en"| vd

```

### Matriz de Operacionalización

| Variable | Dimensión | Indicador | Instrumento |
|----------|-----------|-----------|-------------|
| **Sistema Web** (VI) | Usabilidad | Facilidad de uso | Cuestionario SUS |
| | Funcionalidad | Cumplimiento de requerimientos | Lista de verificación |
| | Fiabilidad | Disponibilidad del sistema | Monitoreo |
| **Gestión de Cotizaciones** (VD) | Tiempo | Minutos por cotización | Cronómetro/logs |
| | Precisión | % de errores | Revisión de datos |
| | Satisfacción | Nivel de satisfacción | Encuesta Likert |

---

<div align="center">

[← Introducción](../01-introduccion.md) | [Índice](../README.md) | [**Marco Teórico →**](../03-marco-teorico/README.md)

</div>

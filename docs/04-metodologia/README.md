# III. Metodología

[← Marco Teórico](../03-marco-teorico/README.md) | [Índice](../README.md) | [El Sistema →](../05-sistema/README.md)

---

## Contenido del Capítulo

| Sección | Descripción |
|---------|-------------|
| [3.1 Tipo y Nivel](#31-tipo-y-nivel-de-investigación) | Enfoque metodológico |
| [3.2 Diseño](#32-diseño-de-investigación) | Estructura del estudio |
| [3.3 Población y Muestra](#33-población-y-muestra) | Sujetos de estudio |
| [3.4 Técnicas e Instrumentos](#34-técnicas-e-instrumentos) | Herramientas de recolección |
| [3.5 Análisis de Datos](#35-análisis-de-datos) | Métodos estadísticos |

---

## 3.1 Tipo y Nivel de Investigación

### Clasificación del Estudio

```mermaid
graph TB
    subgraph tipo["📋 TIPO DE INVESTIGACIÓN"]
        T["APLICADA"]
        T --> T1["Resuelve problema real"]
        T --> T2["Genera solución práctica"]
    end

    subgraph enfoque["🔬 ENFOQUE"]
        E["CUANTITATIVO"]
        E --> E1["Medición numérica"]
        E --> E2["Análisis estadístico"]
    end

    subgraph nivel["📊 NIVEL"]
        N["EXPLICATIVO"]
        N --> N1["Relación causa-efecto"]
        N --> N2["Contrasta hipótesis"]
    end

    style tipo fill:#3498db,stroke:#2980b9,color:#fff
    style enfoque fill:#e74c3c,stroke:#c0392b,color:#fff
    style nivel fill:#27ae60,stroke:#1e8449,color:#fff
```

| Característica | Clasificación | Justificación |
|----------------|---------------|---------------|
| **Tipo** | Aplicada | Soluciona problema real en LC Service |
| **Enfoque** | Cuantitativo | Medición de indicadores numéricos |
| **Nivel** | Explicativo | Determina influencia del sistema web |

---

## 3.2 Diseño de Investigación

### Diseño Pre-Experimental

```mermaid
flowchart LR
    subgraph diseño["📐 DISEÑO PRE-TEST / POST-TEST"]
        direction LR

        G["👥 Grupo<br/>Único"]

        subgraph pre["📋 PRE-TEST"]
            O1["O₁<br/>Medición inicial"]
        end

        subgraph tratamiento["💻 TRATAMIENTO"]
            X["X<br/>Sistema Web"]
        end

        subgraph post["📊 POST-TEST"]
            O2["O₂<br/>Medición final"]
        end

        G --> O1
        O1 --> X
        X --> O2
    end

    style diseño fill:#2c3e50,stroke:#34495e,color:#fff
    style X fill:#9b59b6,stroke:#8e44ad,color:#fff
```

### Esquema del Diseño

```
G: O₁ → X → O₂
```

Donde:
- **G** = Grupo de estudio (personal de ventas)
- **O₁** = Pre-test (medición sin sistema)
- **X** = Implementación del sistema web
- **O₂** = Post-test (medición con sistema)

---

## 3.3 Población y Muestra

### Estructura de la Muestra

```mermaid
pie showData
    title Distribución de la Muestra
    "Vendedores" : 5
    "Administradores" : 2
    "Clientes frecuentes" : 8
```

| Elemento | Descripción | Cantidad |
|----------|-------------|----------|
| **Población** | Personal de LC Service + clientes frecuentes | N = 20 |
| **Muestra** | Censo (población completa) | n = 15 |
| **Muestreo** | No probabilístico, intencional | - |

### Criterios de Inclusión

```mermaid
graph TB
    subgraph criterios["✅ CRITERIOS DE INCLUSIÓN"]
        C1["Personal activo<br/>de LC Service"]
        C2["Clientes con ≥3<br/>cotizaciones"]
        C3["Acceso a<br/>internet"]
        C4["Consentimiento<br/>informado"]
    end

    M{{"👥 MUESTRA<br/>FINAL"}}

    C1 --> M
    C2 --> M
    C3 --> M
    C4 --> M

    style criterios fill:#27ae60,stroke:#1e8449,color:#fff
    style M fill:#3498db,stroke:#2980b9,color:#fff
```

---

## 3.4 Técnicas e Instrumentos

### Matriz de Técnicas e Instrumentos

```mermaid
flowchart TB
    subgraph tecnicas["📝 TÉCNICAS"]
        T1["Encuesta"]
        T2["Observación"]
        T3["Análisis documental"]
    end

    subgraph instrumentos["🔧 INSTRUMENTOS"]
        I1["Cuestionario<br/>Likert"]
        I2["Ficha de<br/>observación"]
        I3["Lista de<br/>verificación"]
    end

    subgraph variables["📊 VARIABLES"]
        V1["Usabilidad"]
        V2["Tiempo"]
        V3["Precisión"]
        V4["Satisfacción"]
    end

    T1 --> I1
    T2 --> I2
    T3 --> I3

    I1 --> V1
    I1 --> V4
    I2 --> V2
    I3 --> V3

    style tecnicas fill:#e74c3c,stroke:#c0392b,color:#fff
    style instrumentos fill:#3498db,stroke:#2980b9,color:#fff
    style variables fill:#27ae60,stroke:#1e8449,color:#fff
```

### Instrumentos Detallados

| Instrumento | Técnica | Variable | Escala |
|-------------|---------|----------|--------|
| Cuestionario SUS | Encuesta | Usabilidad | 1-5 Likert |
| Cronómetro/Logs | Observación | Tiempo | Minutos |
| Lista de cotejo | Análisis | Precisión | % error |
| Encuesta CSAT | Encuesta | Satisfacción | 1-5 Likert |

---

## 3.5 Análisis de Datos

### Plan de Análisis

```mermaid
flowchart TB
    subgraph descriptivo["📊 ANÁLISIS DESCRIPTIVO"]
        D1["Media, Mediana, Moda"]
        D2["Desviación estándar"]
        D3["Tablas de frecuencia"]
        D4["Gráficos estadísticos"]
    end

    subgraph inferencial["📈 ANÁLISIS INFERENCIAL"]
        I1["Prueba de normalidad<br/>(Shapiro-Wilk)"]
        I2{"¿Datos<br/>normales?"}
        I3["t de Student<br/>(paramétrica)"]
        I4["Wilcoxon<br/>(no paramétrica)"]
    end

    D1 --> D2 --> D3 --> D4
    D4 --> I1
    I1 --> I2
    I2 -->|Sí| I3
    I2 -->|No| I4

    style descriptivo fill:#3498db,stroke:#2980b9,color:#fff
    style inferencial fill:#9b59b6,stroke:#8e44ad,color:#fff
```

### Criterios de Decisión

| Nivel de Significancia | Decisión |
|------------------------|----------|
| p < 0.05 | Rechazar H₀ (diferencia significativa) |
| p ≥ 0.05 | No rechazar H₀ (sin diferencia significativa) |

### Herramientas de Análisis

```mermaid
graph LR
    subgraph herramientas["🛠️ SOFTWARE UTILIZADO"]
        H1["📊 SPSS 26"]
        H2["📈 Excel"]
        H3["📉 R Studio"]
    end

    subgraph uso["📋 USO"]
        U1["Estadística inferencial"]
        U2["Gráficos descriptivos"]
        U3["Visualizaciones"]
    end

    H1 --> U1
    H2 --> U2
    H3 --> U3

    style herramientas fill:#34495e,stroke:#2c3e50,color:#fff
```

---

## Resumen Metodológico

```mermaid
graph TB
    subgraph resumen["📋 RESUMEN METODOLÓGICO"]
        R1["Tipo: Aplicada"]
        R2["Enfoque: Cuantitativo"]
        R3["Nivel: Explicativo"]
        R4["Diseño: Pre-experimental"]
        R5["Muestra: n=15"]
        R6["Técnica: Encuesta + Observación"]
        R7["Análisis: Descriptivo + Inferencial"]
    end

    R1 --> R2 --> R3 --> R4 --> R5 --> R6 --> R7

    style resumen fill:#2c3e50,stroke:#34495e,color:#fff
```

---

<div align="center">

[← Marco Teórico](../03-marco-teorico/README.md) | [Índice](../README.md) | [**El Sistema →**](../05-sistema/README.md)

</div>

# Introducción

[← Volver al Índice](./README.md) | [Siguiente: Planteamiento del Problema →](./02-planteamiento-problema/README.md)

---

## Contexto del Proyecto

En la actualidad, las empresas del sector de fabricación y mantenimiento de equipos gastronómicos enfrentan desafíos crecientes en cuanto a la **eficiencia operativa**, la **competitividad** y la **satisfacción del cliente**. Estos retos se intensifican por la demanda de respuestas rápidas y precisas a solicitudes comerciales, especialmente en procesos de cotización.

```mermaid
graph TB
    subgraph contexto["🌍 CONTEXTO EMPRESARIAL"]
        direction LR
        C1["Competencia<br/>creciente"]
        C2["Clientes más<br/>exigentes"]
        C3["Necesidad de<br/>respuesta rápida"]
    end

    subgraph empresa["🏭 LC SERVICE"]
        E1["Fabricación de<br/>equipos gastronómicos"]
        E2["Mantenimiento<br/>especializado"]
        E3["Acero<br/>inoxidable"]
    end

    subgraph problema["⚠️ SITUACIÓN ACTUAL"]
        P1(("Procesos<br/>manuales"))
        P2(("Hojas de<br/>cálculo"))
        P3(("Sin<br/>centralización"))
    end

    contexto --> empresa
    empresa --> problema

```

---

## La Empresa: LC Service

**LC Service** es una empresa dedicada a la fabricación y mantenimiento de equipos gastronómicos de acero inoxidable. La gestión de cotizaciones es un proceso crucial para el área de ventas, pues constituye el primer contacto formal con el cliente y puede determinar el cierre de una negociación.

### Situación Problemática

| Aspecto | Problema Identificado |
|---------|----------------------|
| **Método** | Proceso manual con hojas de cálculo dispersas |
| **Comunicación** | Canales no centralizados |
| **Resultado** | Demoras, errores de transcripción, dificultad de seguimiento |

---

## La Solución: Transformación Digital

```mermaid
flowchart LR
    subgraph tradicional["🔴 MÉTODO TRADICIONAL"]
        T1["📄 Excel"]
        T2["📧 Email disperso"]
        T3["📝 Documentos físicos"]
    end

    TD{{"🚀 TRANSFORMACIÓN<br/>DIGITAL"}}

    subgraph moderno["🟢 SISTEMA WEB"]
        M1["💻 Plataforma centralizada"]
        M2["📊 Reportes automáticos"]
        M3["🔒 Acceso seguro"]
    end

    tradicional --> TD
    TD --> moderno

```

La **transformación digital** emerge como una solución estratégica para modernizar los procesos internos y mejorar la capacidad de respuesta al cliente.

---

## Propuesta de Investigación

El presente trabajo se enmarca en el diseño e implementación de un **sistema web** orientado a la gestión integral de cotizaciones para LC Service, con un enfoque basado en la transformación digital.

### Objetivos del Sistema

```mermaid
mindmap
  root((Sistema Web<br/>LC Service))
    Crear cotizaciones
      Rápido
      Preciso
      Automatizado
    Gestionar clientes
      Base de datos
      Historial
      Seguimiento
    Generar reportes
      Métricas
      KPIs
      Tendencias
    Control de acceso
      Roles
      Permisos
      Seguridad
```

---

## Beneficios Esperados

| Beneficio | Descripción |
|-----------|-------------|
| ⏱️ **Reducción de tiempo** | Menor tiempo en elaboración de cotizaciones |
| ✅ **Minimizar errores** | Datos precisos y validados |
| 📊 **Seguimiento eficiente** | Trazabilidad de cada solicitud |
| 📈 **Decisiones estratégicas** | Reportes basados en datos reales |

---

## Impacto Organizacional

```mermaid
graph TB
    subgraph impacto["📈 IMPACTO DEL SISTEMA"]
        direction TB

        I1["🎯 Área de Ventas"]
        I2["📦 Control de Inventario"]
        I3["🏭 Planificación de Producción"]
        I4["💬 Comunicación Interna"]
    end

    S[("💻 SISTEMA WEB")]

    S --> I1
    S --> I2
    S --> I3
    S --> I4

```

---

## Alcance del Proyecto

Este proyecto no solo tendrá un impacto interno en la empresa, sino que también puede servir como **referencia para otras organizaciones** del mismo rubro que enfrentan retos similares. La experiencia obtenida en este proceso de diseño e implementación podrá ser replicada y adaptada en distintos contextos.

---

<div align="center">

[← Índice](./README.md) | [**Siguiente: Planteamiento del Problema →**](./02-planteamiento-problema/README.md)

</div>

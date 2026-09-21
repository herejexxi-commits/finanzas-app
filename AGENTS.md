---
description: Memoria del proyecto, reglas generales y contexto de despliegue.
trigger: always_on
---

# Memoria del Proyecto y Reglas (Finanzas App)

## Contexto del Proyecto
- **Aplicación:** Plataforma de finanzas personales para registrar ingresos y gastos.
- **Tecnologías:** React, Vite, Supabase.

## Regla Crítica de Despliegue y Pruebas
**El usuario SIEMPRE prueba y utiliza esta aplicación en su versión pública en línea (alojada en Vercel).**

Por lo tanto:
1. Después de implementar cambios exitosamente en el entorno local, debes realizar un `git commit` y un `git push origin main` para que los cambios se suban al repositorio y Vercel despliegue la nueva versión.
2. Siempre recuérdale al usuario que espere un par de minutos a que Vercel termine la compilación y que refresque su página en producción para ver los cambios.
3. No asumas que el usuario está viendo los cambios locales en `localhost` a menos que él lo especifique claramente.

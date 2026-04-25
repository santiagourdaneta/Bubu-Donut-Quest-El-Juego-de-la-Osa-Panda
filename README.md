# 🐼 BUBU DONUT QUEST v1.0
> **High-Performance Data-Driven Arcade Engine**
> "Optimized for the decade, built for the soul."

---

## 🛠 TECH STACK / ARCHITECTURE
Este proyecto ha sido desarrollado bajo una filosofía **Minimalista & HTML-First**, eliminando el overhead de frameworks modernos para maximizar los frames por segundo (FPS) y la eficiencia del DOM.

* **Engine:** Custom JavaScript Main Loop (Zero-Dependency).
* **Physics:** Circular Collision Logic based on $a^2 + b^2 = c^2$.
* **Audio:** Dynamic Audio Engine (Mozart K.550) with real-time pitch scaling.
* **Visuals:** Canvas API with CSS-Hardware-Accelerated Feedback.
* **Deployment:** GitHub Pages (Static Edge Delivery).

## 🚀 FEATURES
* **Atmospheric Escalation:** El entorno cambia de rosa a púrpura profundo según la densidad de datos (donas).
* **Psychology of Color:** Sistema de feedback visual mediante destellos y sacudidas de cámara (Screenshake).
* **E2E Ready:** El motor expone estados globales para pruebas de integración y bots automatizados.
* **Retro Aesthetics:** Inspirado en la cultura técnica de los 90 y principios de los 2000.

## 🕹 INSTALACIÓN
No requiere `npm install`. No requiere configuración compleja.

1. Clona el repositorio.
2. Abre `index.html` en tu navegador (o usa un servidor local ligero).
3. Haz click en la pantalla para inicializar el **Mozart Sound Engine**.

```bash
# Para correr localmente (opcional)
python -m http.server 8080

📊 INTEGRATION TESTS
El sistema incluye hooks para pruebas de estrés y rendimiento:

testIntegrationDifficulty(): Valida la curva de escalabilidad.

runPerformanceTest(n): Inyecta n entidades para estresar el Event Loop.

🏗 AUTHOR
Santiago Urdaneta Anton Senior Software Architect Lima, Perú | 2026

"HTML is enough. Performance is a feature."


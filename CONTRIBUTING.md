# Cómo contribuir

Este repositorio es un **espejo de solo lectura** del SDK de Node.js de
Winora. El código se desarrolla en el repositorio interno de Winora, y aquí
llega una copia por cada versión publicada en npm. Por eso no se aceptan pull
requests: un cambio hecho aquí se perdería en la siguiente versión.

Lo que sí sirve, y mucho:

- **Reportar un error o pedir algo:** abre un issue con la versión del SDK
  (`npm ls @winorapay/node`), la de Node.js y un ejemplo mínimo. **Nunca pegues
  tu llave de API** (`wk_…`) ni el secreto de un webhook (`whsec_…`).
- **Una vulnerabilidad:** no abras un issue público. Sigue [SECURITY.md](./SECURITY.md).

Para probar el SDK en tu máquina:

```bash
npm ci
npm run build
npm test
```

Los tipos (`src/generated/openapi.ts`) salen del OpenAPI público
(`openapi.json`); `npm run gen:types` los regenera.

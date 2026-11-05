# Cambios de @winorapay/node

Formato: cada versión publicada, con lo que cambia para quien integra.
Mientras el SDK esté en 0.x, una versión menor puede traer cambios
incompatibles, y se marcan como **Incompatible**.

## 0.0.1

Primera versión.

- Cliente `Winora` con llave `wk_test_…` / `wk_live_…`. El modo lo define la
  llave, y la llave nunca aparece en errores, logs ni `JSON.stringify`.
- Recursos de toda la API pública:
  - `charges` y `charges.refunds`;
  - `receivables` y `debtors`;
  - `subscriptionPlans` y `subscriptions`;
  - `winora.request()` para cualquier otra ruta.
- Idempotencia automática en las escrituras: el SDK genera la `Idempotency-Key`
  si no pasas la tuya, y la mantiene en sus reintentos.
- Reintentos seguros, siempre con la misma llave:
  - sin respuesta, o un 5xx que no vino de Winora (502/504 del balanceador);
  - 429, respetando `Retry-After` (hasta 10 s);
  - 409 `request/in-progress`;
  - 5xx de Winora, solo en lecturas.
- Cada error trae `retryable`: si es `true`, repetir con la misma
  `idempotencyKey` es seguro.
- Listados paginados con `await` (una página) o `for await` (todas).
- `webhooks.constructEvent` verifica la firma `Winora-Signature` y devuelve el
  evento tipado por `type`. Incluye `generateTestHeader` para probar tu endpoint.
- Tipos de TypeScript generados desde el OpenAPI público. Funciona con ESM y
  CommonJS.

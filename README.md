# @winorapay/node

SDK oficial de [Winora](https://winorapay.com) para Node.js 18 o más:
cobros, reembolsos, cartera, suscripciones y webhooks, con tipos de
TypeScript sacados del OpenAPI público. Sin dependencias.

```bash
npm install @winorapay/node
```

> **Versión 0.x.** Mientras el SDK esté en 0.x, una versión menor (0.1 → 0.2)
> puede traer cambios incompatibles; están en el `CHANGELOG.md` que viene en el paquete.
> Fija la versión en tu `package.json`.

## Uso

La llave secreta (`wk_test_…` o `wk_live_…`) va solo en tu servidor, nunca en
el navegador. Genérala en **Organización → API keys**.

```ts
import { Winora, WinoraError } from '@winorapay/node';

const winora = new Winora(process.env.WINORA_API_KEY!); // wk_test_… o wk_live_…

// Cobro: redirige a checkoutUrl. La Idempotency-Key la pone el SDK, o pasa la tuya.
const { transaction, checkoutUrl } = await winora.charges.create(
  { amount: 50000, reference: 'Pedido 1001', customerEmail: 'ana@correo.com' },
  { idempotencyKey: 'pedido-1001' },
);

// Una página, o todas con for await.
const page = await winora.charges.list({ status: 'APPROVED' });
for await (const tx of winora.charges.list({ status: 'APPROVED' })) {
  console.log(tx.reference, tx.amount);
}

try {
  await winora.receivables.create({
    /* … */
  });
} catch (e) {
  if (e instanceof WinoraError) console.error(e.code, e.message, e.retryable);
  else throw e;
}
```

Avisos:

- `charges.refunds.create(id)` sin `amount` reembolsa **todo** el saldo que queda.
- La paginación es por número de página: si el conjunto cambia mientras lo
  recorres (cobros que pasan de PENDING a APPROVED), se pueden saltar o repetir
  elementos. Para conciliar, filtra por fechas cerradas.

Recursos: `charges` (y `charges.refunds`), `receivables`, `debtors`,
`subscriptionPlans` y `subscriptions`. Para una ruta que aún no esté
envuelta, `winora.request(método, ruta, opciones)`.

## Webhooks

```ts
import express from 'express';
import { webhooks, WinoraSignatureError } from '@winorapay/node';

// El cuerpo CRUDO: la firma va sobre los bytes tal como llegaron.
app.post('/winora/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = webhooks.constructEvent(
      req.body,
      req.get('Winora-Signature'),
      process.env.WINORA_WEBHOOK_SECRET!,
    );
  } catch (e) {
    if (e instanceof WinoraSignatureError) return res.sendStatus(400);
    throw e;
  }
  res.sendStatus(200); // 2xx a todo evento, aunque no lo uses: lo demás se reintenta

  // Winora reintenta si no recibió tu 200, y el panel permite reenviar:
  // el mismo evento puede llegar más de una vez, siempre con el mismo id.
  if (await yaProcesado(event.id)) return;

  switch (event.type) {
    case 'payment.approved': {
      const tx = event.data.transaction; // tipado
      // Los cobros con llave wk_test_ también avisan a tus endpoints.
      if (tx.mode === 'live') await entregarPedido(tx);
      break;
    }
    default:
      break; // tipos que no usas, o que Winora agregue después
  }
  await marcarProcesado(event.id);
});
```

`constructEvent` verifica la firma (HMAC-SHA256 con tu `whsec_…`), rechaza
firmas de más de 5 minutos y devuelve el evento tipado según su `type`. Para
probar tu endpoint sin Winora: `webhooks.generateTestHeader(cuerpo, secreto)`.

- **Repetidos:** descarta por `event.id`. Un reintento llega con firma nueva,
  así que la ventana de 5 minutos no lo frena.
- **Pruebas:** revisa `mode` antes de entregar algo real.
- **Tipos nuevos:** deja un `default` que no falle. Si tu endpoint responde
  500 a un tipo que no conoce, Winora lo seguirá reintentando.
- Sirve para los webhooks de **Organización → Webhooks** (secreto `whsec_…`).
  El aviso al `confirmationUrl` de un link de pago usa otro secreto y no se
  verifica con este método.

## Errores

Lo que falla al hablar con Winora llega como `WinoraError` o una subclase.
Decide por `code`, que es estable; el `message` es para personas y puede
cambiar. La excepción es `WinoraConfigError`: un error de tu código (una
llave u opción inválida), que no es subclase de `WinoraError`.

| Campo            | Qué es                                                                     |
| ---------------- | -------------------------------------------------------------------------- |
| `code`           | Código del API (`payment/invalid-customer-email`) o del SDK (`sdk/…`)      |
| `status`         | HTTP de la respuesta, o `null` si no llegó respuesta                       |
| `retryable`      | Si repetir la misma petición, tal cual, tiene sentido                      |
| `idempotencyKey` | La llave que se mandó en una escritura: úsala para repetirla o consultarla |
| `requestId`      | `X-Request-Id` de la respuesta: dáselo a soporte si escribes a Winora      |

| Clase                   | Cuándo                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `WinoraError`           | El API respondió con un error (4xx o 5xx)                                                                        |
| `WinoraConnectionError` | No llegó respuesta (red caída, timeout). Subclase de `WinoraError`                                               |
| `WinoraSignatureError`  | La firma de un webhook no sirve. Subclase de `WinoraError`                                                       |
| `WinoraConfigError`     | La llave, una opción o un argumento no sirven. Se lanza antes de enviar nada. Extiende `Error`, no `WinoraError` |

Códigos propios del SDK:

- `sdk/timeout` y `sdk/connection-error`: no llegó respuesta.
- `sdk/request-error`: la petición no salió.
- `sdk/unknown-outcome`: no se sabe si llegó. En una escritura, repítela con la
  misma `idempotencyKey`, que viene en el error.
- `sdk/webhook-*`: problemas con la firma de un webhook.
- `http/<status>` (p. ej. `http/504`): una respuesta que no escribió Winora,
  como un 502 o 504 del balanceador. La operación pudo quedar hecha: repítela
  con la misma `idempotencyKey`.

## Opciones

```ts
new Winora(llave, {
  baseUrl: 'https://api.winorapay.com/api/v1', // por defecto
  timeoutMs: 30_000, // por intento
  maxNetworkRetries: 2, // 0 a 5
  retryBaseDelayMs: 500,
  fetch, // un fetch propio (proxy, pruebas)
});
```

## Reintentos

El SDK repite solo lo que es seguro repetir, hasta `maxNetworkRetries` veces.
Las escrituras se repiten siempre con la misma `Idempotency-Key`.

| Qué pasó                                                                        | El SDK                                                                                                          |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Sin respuesta (red caída, timeout)                                              | Repite                                                                                                          |
| 5xx que **no** vino de Winora (`code` `http/502`, `http/504`…, del balanceador) | Repite, también en escrituras: pudo quedar hecha                                                                |
| 429                                                                             | Espera lo que diga `Retry-After` y repite. No repite si pide más de 10 s, ni con `api/too-many-failed-attempts` |
| 409 `request/in-progress` (la misma llave sigue en curso)                       | Espera y repite                                                                                                 |
| 5xx de Winora (trae un `code` del API) en una lectura                           | Repite                                                                                                          |
| 5xx de Winora en una escritura                                                  | **No repite**: el intento quedó registrado como fallido                                                         |
| Cualquier otro 4xx                                                              | No repite                                                                                                       |

Si el error te llega a ti, **decide por `retryable`, no por `status`**:

- **`retryable: true`:** repite la MISMA llamada con la MISMA `idempotencyKey`
  (viene en el error). Winora devuelve lo que pasó en vez de hacerlo dos veces.
  Así se cubren `sdk/unknown-outcome`, `sdk/timeout` y los `http/5xx` del
  balanceador: en esos casos la operación pudo quedar hecha, y una llave nueva
  la duplicaría.
- **`retryable: false` con un 5xx de Winora en una escritura:** el intento
  falló y la misma llave devolverá ese fallo. Consulta el estado (por ejemplo
  `charges.retrieve`) y, solo si no quedó hecho, repite con una llave nueva.
- **429 (`retryable: true`):** repite, pero **más tarde**, no en bucle. El SDK
  ya esperó lo que podía (hasta 10 s). `api/too-many-failed-attempts` es un
  bloqueo temporal por muchos intentos fallidos y dura varios minutos.
- **`retryable: false` con un 4xx:** corrige la petición; repetirla igual no
  sirve.
- **`retryable: false` sin `status` (`sdk/request-error`):** la petición no
  salió; corrígela.

Guía completa: https://merchant.winorapay.com/docs · Licencia MIT.

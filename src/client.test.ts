// Cliente del SDK: autenticación, desempaque, errores, reintentos
// e idempotencia, con un `fetch` falso.
//
// La regla de reintentos sale de cómo se comporta el API: una escritura que
// recibió un 5xx NO se repite (el intento quedó registrado como fallido y la
// misma llave devuelve ese fallo); sin respuesta sí, con la MISMA llave.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspect } from 'node:util';
import { describe, it } from 'node:test';
import {
  VERSION,
  Winora,
  WinoraConfigError,
  WinoraConnectionError,
  WinoraError,
} from '@winorapay/node';

const KEY = 'wk_test_AbCdEfGhIjKlMnOp1234';

type Call = { url: string; init: RequestInit & { headers: Record<string, string> } };
type Step = Response | Error | ((init: RequestInit) => Promise<Response>);

/** `fetch` falso: responde con los pasos en orden y anota cada llamada. */
function fakeFetch(steps: Step[]) {
  const calls: Call[] = [];
  const fn = (async (url: string, init: any) => {
    calls.push({ url, init });
    const step = steps[Math.min(calls.length - 1, steps.length - 1)]!;
    if (step instanceof Error) throw step;
    if (typeof step === 'function') return step(init);
    return step.clone();
  }) as unknown as typeof fetch;
  return { fn, calls };
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
const ok = (data: unknown) => json(200, { ok: true, data });
const fail = (status: number, code: string, message = 'falló', headers = {}) =>
  json(status, { ok: false, error: { code, message } }, headers);

function client(steps: Step[], opts: Record<string, unknown> = {}) {
  const f = fakeFetch(steps);
  const winora = new Winora(KEY, {
    fetch: f.fn,
    retryBaseDelayMs: 1,
    baseUrl: 'https://api.ejemplo.test/api/v1',
    ...opts,
  });
  return { winora, calls: f.calls };
}

describe('llave y configuración', () => {
  it('rechaza una llave que no es de Winora, sin repetirla en el mensaje', () => {
    assert.throws(
      () => new Winora('sk_live_secreta_123'),
      (e: any) => e instanceof WinoraConfigError && !e.message.includes('secreta'),
    );
    assert.throws(() => new Winora(''), WinoraConfigError);
  });

  it('el modo lo decide la llave', () => {
    assert.equal(new Winora(KEY).mode, 'test');
    assert.equal(new Winora('wk_live_ZyXwVuTsRqPoNmLk9876').mode, 'live');
  });

  it('nunca muestra la llave al imprimir el cliente', () => {
    const w = new Winora(KEY);
    assert.doesNotMatch(inspect(w), /AbCdEfGh/);
    assert.doesNotMatch(JSON.stringify(w), /AbCdEfGh/);
    assert.match(inspect(w), /wk_test_…1234/);
  });

  it('la versión del User-Agent es la del package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    assert.equal(VERSION, pkg.version);
  });
});

describe('peticiones', () => {
  it('una lectura: autenticada, sin Idempotency-Key, con la query limpia y data desempacado', async () => {
    const { winora, calls } = client([ok({ id: 'tx-1' })]);
    const data = await winora.request('GET', '/charges', {
      query: { status: 'APPROVED', q: undefined, page: 2 },
    });
    assert.deepEqual(data, { id: 'tx-1' });
    assert.equal(calls[0]!.url, 'https://api.ejemplo.test/api/v1/charges?status=APPROVED&page=2');
    const h = calls[0]!.init.headers;
    assert.equal(h.Authorization, `Bearer ${KEY}`);
    assert.match(h['User-Agent']!, /^winorapay-node\/\d+\.\d+\.\d+ node\/v/);
    assert.equal(h['Idempotency-Key'], undefined);
  });

  it('una escritura lleva Idempotency-Key: la propia o una generada', async () => {
    const { winora, calls } = client([ok({}), ok({})]);
    await winora.request('POST', '/charges', {
      body: { amount: 50000 },
      idempotencyKey: 'pedido-1001',
    });
    await winora.request('POST', '/charges', { body: { amount: 50000 } });
    assert.equal(calls[0]!.init.headers['Idempotency-Key'], 'pedido-1001');
    assert.match(calls[1]!.init.headers['Idempotency-Key']!, /^[0-9a-f-]{36}$/);
    assert.equal(calls[0]!.init.body, '{"amount":50000}');
    assert.equal(calls[0]!.init.headers['Content-Type'], 'application/json');
  });
});

describe('reintentos', () => {
  it('sin respuesta: repite la escritura con la MISMA llave', async () => {
    const { winora, calls } = client([new TypeError('fetch failed'), ok({ id: 'tx-1' })]);
    const data = await winora.request('POST', '/charges', { body: {} });
    assert.deepEqual(data, { id: 'tx-1' });
    assert.equal(calls.length, 2);
    assert.equal(
      calls[0]!.init.headers['Idempotency-Key'],
      calls[1]!.init.headers['Idempotency-Key'],
    );
  });

  it('sin respuesta tras agotar los reintentos: error de conexión con la llave para repetir', async () => {
    const { winora, calls } = client([new TypeError('fetch failed')], { maxNetworkRetries: 2 });
    await assert.rejects(winora.request('POST', '/charges', { body: {} }), (e: any) => {
      assert.ok(e instanceof WinoraConnectionError);
      assert.equal(e.status, null);
      assert.equal(e.code, 'sdk/connection-error');
      assert.equal(e.retryable, true);
      assert.match(e.idempotencyKey, /^[0-9a-f-]{36}$/);
      assert.match(e.message, /misma idempotencyKey/i);
      return true;
    });
    assert.equal(calls.length, 3);
  });

  it('el timeout es un error de conexión con su propio código', async () => {
    // Una conexión que nunca responde. El temporizador sostiene el proceso
    // como lo haría el socket abierto (el de AbortSignal.timeout no lo hace).
    const hang = (init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        const alive = setTimeout(() => undefined, 5_000);
        init.signal!.addEventListener('abort', () => {
          clearTimeout(alive);
          reject(init.signal!.reason);
        });
      });
    const { winora } = client([hang], { timeoutMs: 20, maxNetworkRetries: 0 });
    await assert.rejects(
      winora.request('GET', '/charges'),
      (e: any) => e instanceof WinoraConnectionError && e.code === 'sdk/timeout',
    );
  });

  it('5xx en una escritura: NO repite; dice consultar y usar una llave nueva', async () => {
    const { winora, calls } = client([
      fail(502, 'payment/provider-error', 'La pasarela falló', { 'x-request-id': 'req-123' }),
    ]);
    await assert.rejects(winora.request('POST', '/charges', { body: {} }), (e: any) => {
      assert.ok(e instanceof WinoraError);
      assert.equal(e.status, 502);
      assert.equal(e.code, 'payment/provider-error');
      assert.equal(e.retryable, false);
      assert.equal(e.requestId, 'req-123');
      assert.match(e.message, /idempotencyKey nueva/);
      return true;
    });
    assert.equal(calls.length, 1);
  });

  it('5xx en una lectura: repite', async () => {
    const { winora, calls } = client([fail(503, 'internal/error'), ok({ id: 'tx-1' })]);
    assert.deepEqual(await winora.request('GET', '/charges/tx-1'), { id: 'tx-1' });
    assert.equal(calls.length, 2);
  });

  it('429: espera lo que diga Retry-After y repite (también una escritura)', async () => {
    const { winora, calls } = client([
      fail(429, 'api/rate-limited', 'Demasiadas', { 'retry-after': '0' }),
      ok({ id: 'tx-1' }),
    ]);
    assert.deepEqual(await winora.request('POST', '/charges', { body: {} }), { id: 'tx-1' });
    assert.equal(calls.length, 2);
    assert.equal(
      calls[0]!.init.headers['Idempotency-Key'],
      calls[1]!.init.headers['Idempotency-Key'],
    );
  });

  it('429 con una espera larga: no bloquea, devuelve el error como reintentable', async () => {
    const { winora, calls } = client([
      fail(429, 'api/too-many-failed-attempts', 'Espera', { 'retry-after': '300' }),
    ]);
    await assert.rejects(
      winora.request('GET', '/charges'),
      (e: any) => e.code === 'api/too-many-failed-attempts' && e.retryable === true,
    );
    assert.equal(calls.length, 1);
  });

  it('4xx: nunca repite, trae el código del API', async () => {
    const { winora, calls } = client([
      fail(400, 'payment/invalid-customer-email', '¿Quisiste decir gmail.com?'),
    ]);
    await assert.rejects(winora.request('POST', '/charges', { body: {} }), (e: any) => {
      assert.equal(e.code, 'payment/invalid-customer-email');
      assert.equal(e.message, '¿Quisiste decir gmail.com?');
      assert.equal(e.retryable, false);
      return true;
    });
    assert.equal(calls.length, 1);
  });

  it('una respuesta que no es JSON se vuelve un error con el HTTP', async () => {
    const { winora } = client([new Response('<html>Bad Gateway</html>', { status: 502 })], {
      maxNetworkRetries: 0,
    });
    await assert.rejects(winora.request('GET', '/charges'), (e: any) => e.code === 'http/502');
  });

  it('ningún error lleva la llave', async () => {
    const { winora } = client([fail(401, 'api/invalid-key', 'Llave inválida')]);
    const err = await winora.request('GET', '/charges').catch((e) => e);
    assert.doesNotMatch(JSON.stringify(err), /AbCdEfGh/);
    assert.doesNotMatch(inspect(err), /AbCdEfGh/);
  });
});

describe('casos límite de red y respuestas raras', () => {
  const sinSobre = (status: number) => new Response('<html>Gateway Timeout</html>', { status });

  it('un 504 del balanceador en una escritura se repite con la MISMA llave', async () => {
    const { winora, calls } = client([sinSobre(504), ok({ id: 'lote-1' })]);
    assert.deepEqual(await winora.request('POST', '/receivables/batch', { body: {} }), {
      id: 'lote-1',
    });
    assert.equal(calls.length, 2);
    assert.equal(
      calls[0]!.init.headers['Idempotency-Key'],
      calls[1]!.init.headers['Idempotency-Key'],
    );
  });

  it('un 502 sin sobre tras agotar los reintentos: misma llave, nunca "llave nueva"', async () => {
    const { winora } = client([sinSobre(502)], { maxNetworkRetries: 1 });
    await assert.rejects(winora.request('POST', '/charges', { body: {} }), (e: any) => {
      assert.equal(e.code, 'http/502');
      assert.equal(e.retryable, true);
      assert.match(e.message, /MISMA idempotencyKey/);
      assert.doesNotMatch(e.message, /nueva/);
      return true;
    });
  });

  it('una idempotencyKey vacía, con espacios o muy corta se rechaza antes de enviar', async () => {
    for (const bad of ['', '   ', ' pedido-1001', 'corta', 'x'.repeat(101), 'pedido—1001']) {
      const { winora, calls } = client([ok({})]);
      await assert.rejects(
        winora.request('POST', '/receivables', { body: {}, idempotencyKey: bad }),
        WinoraConfigError,
        `debió rechazar ${JSON.stringify(bad)}`,
      );
      assert.equal(calls.length, 0);
    }
  });

  it('409 request/in-progress: espera y repite con la misma llave', async () => {
    const { winora, calls } = client([
      fail(409, 'request/in-progress', 'Reintenta en unos segundos'),
      ok({ id: 'deuda-1' }),
    ]);
    assert.deepEqual(await winora.request('POST', '/receivables', { body: {} }), {
      id: 'deuda-1',
    });
    assert.equal(
      calls[0]!.init.headers['Idempotency-Key'],
      calls[1]!.init.headers['Idempotency-Key'],
    );
  });

  it('un error de fetch que no es de red no se repite ni se informa como conexión', async () => {
    const invalid = Object.assign(new TypeError('Invalid header value'), {
      cause: { code: 'UND_ERR_INVALID_ARG' },
    });
    const { winora, calls } = client([invalid]);
    await assert.rejects(winora.request('POST', '/charges', { body: {} }), (e: any) => {
      assert.ok(!(e instanceof WinoraConnectionError));
      assert.equal(e.code, 'sdk/request-error');
      assert.equal(e.retryable, false);
      return true;
    });
    assert.equal(calls.length, 1);
  });

  it('un error de red con código conocido sí se repite', async () => {
    const reset = Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNRESET' } });
    const { winora, calls } = client([reset, ok({ id: 'tx-1' })]);
    await winora.request('GET', '/charges/tx-1');
    assert.equal(calls.length, 2);
  });

  it('las redirecciones no se siguen (un POST no puede volverse GET)', async () => {
    const { winora, calls } = client([ok({})]);
    await winora.request('POST', '/charges', { body: {} });
    assert.equal(calls[0]!.init.redirect, 'error');
  });

  it('opciones inválidas fallan al crear el cliente', () => {
    const bad: Record<string, unknown>[] = [
      { baseUrl: 'http://api.winorapay.com/api/v1' },
      { baseUrl: 'no es una url' },
      { timeoutMs: Number.NaN },
      { timeoutMs: -1 },
      { maxNetworkRetries: Number.POSITIVE_INFINITY },
      { maxNetworkRetries: 1.5 },
    ];
    for (const options of bad) {
      assert.throws(() => new Winora(KEY, options), WinoraConfigError, JSON.stringify(options));
    }
    // http solo en local (para probar contra el API en el computador).
    assert.doesNotThrow(() => new Winora(KEY, { baseUrl: 'http://localhost:3001/api/v1' }));
  });

  it('una llave demasiado corta no se acepta (la máscara la mostraría entera)', () => {
    assert.throws(() => new Winora('wk_live_ab'), WinoraConfigError);
  });

  it('un 2xx que no es JSON en una escritura: consultar y repetir con la misma llave', async () => {
    const { winora } = client([new Response('OK', { status: 200 })], { maxNetworkRetries: 0 });
    await assert.rejects(winora.request('POST', '/charges', { body: {} }), (e: any) => {
      assert.equal(e.retryable, true);
      assert.match(e.message, /MISMA idempotencyKey/);
      return true;
    });
  });

  it('el bloqueo por intentos fallidos no se espera dentro de la llamada', async () => {
    const { winora, calls } = client([
      fail(429, 'api/too-many-failed-attempts', 'Espera', { 'retry-after': '5' }),
    ]);
    const start = Date.now();
    await assert.rejects(
      winora.request('GET', '/charges'),
      (e: any) => e.code === 'api/too-many-failed-attempts' && e.retryable === true,
    );
    assert.equal(calls.length, 1);
    assert.ok(Date.now() - start < 1000);
  });
});

describe('redirecciones y errores de fetch', () => {
  it('una redirección real: no se repite y NO dice que la escritura no salió', async () => {
    const { createServer } = await import('node:http');
    let received = 0;
    const server = createServer((_req, res) => {
      received++;
      res.writeHead(302, { location: '/otra' }).end();
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const port = (server.address() as { port: number }).port;
    try {
      const winora = new Winora(KEY, {
        baseUrl: `http://127.0.0.1:${port}/api/v1`,
        retryBaseDelayMs: 1,
      });
      await assert.rejects(winora.request('POST', '/receivables', { body: {} }), (e: any) => {
        assert.equal(e.code, 'sdk/unknown-outcome');
        assert.equal(e.retryable, true);
        assert.match(e.message, /MISMA idempotencyKey/);
        assert.doesNotMatch(e.message, /no se pudo enviar/);
        return true;
      });
      assert.equal(received, 1, 'el servidor sí recibió la escritura, y una sola vez');
    } finally {
      server.close();
    }
  });

  it('un fetch propio con el código de red arriba (node-fetch) se reconoce como red', async () => {
    const hangUp = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' });
    const { winora, calls } = client([hangUp, ok({ id: 'deuda-1' })]);
    await winora.request('POST', '/receivables', { body: {} });
    assert.equal(calls.length, 2);
    assert.equal(
      calls[0]!.init.headers['Idempotency-Key'],
      calls[1]!.init.headers['Idempotency-Key'],
    );
  });

  it('baseUrl con query, fragmento o usuario se rechaza', () => {
    for (const baseUrl of [
      'https://api.winorapay.com/api/v1?x=1',
      'https://api.winorapay.com/api/v1#a',
      'https://yo:clave@api.winorapay.com/api/v1',
    ]) {
      assert.throws(() => new Winora(KEY, { baseUrl }), WinoraConfigError, baseUrl);
    }
  });
});

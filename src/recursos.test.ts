// Recursos del SDK: paginación, ids en la ruta, cuerpos e idempotencia.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Winora } from '@winorapay/node';

function harness(respond: (url: URL, init: any) => unknown) {
  const calls: Array<{ method: string; url: URL; init: any }> = [];
  const fetch = (async (url: string, init: any) => {
    const u = new URL(url);
    calls.push({ method: init.method, url: u, init });
    return new Response(JSON.stringify({ ok: true, data: respond(u, init) }), { status: 200 });
  }) as unknown as typeof globalThis.fetch;
  const w = new Winora('wk_test_AbCdEfGhIjKlMnOp1234', {
    fetch,
    baseUrl: 'https://api.ejemplo.test/api/v1',
  });
  return { w, calls };
}

/** Tres páginas de dos cobros. */
const pages = (url: URL) => {
  const page = Number(url.searchParams.get('page') ?? 1);
  return {
    items: [{ id: `tx-${page}a` }, { id: `tx-${page}b` }],
    meta: { page, pageSize: 2, total: 6, totalPages: 3 },
  };
};

describe('listados paginados', () => {
  it('await trae una sola página (la 1, o la pedida)', async () => {
    const { w, calls } = harness(pages);
    const first = await w.charges.list({ status: 'APPROVED' });
    assert.deepEqual(
      first.items.map((t: any) => t.id),
      ['tx-1a', 'tx-1b'],
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.url.searchParams.get('status'), 'APPROVED');
    const third = await w.charges.list({ page: 3 });
    assert.equal(third.meta.page, 3);
  });

  it('for await recorre todas las páginas, pidiendo cada una una sola vez', async () => {
    const { w, calls } = harness(pages);
    const ids: string[] = [];
    for await (const tx of w.charges.list({ status: 'APPROVED' })) ids.push((tx as any).id);
    assert.deepEqual(ids, ['tx-1a', 'tx-1b', 'tx-2a', 'tx-2b', 'tx-3a', 'tx-3b']);
    assert.deepEqual(
      calls.map((c) => c.url.searchParams.get('page')),
      ['1', '2', '3'],
    );
    assert.ok(calls.every((c) => c.url.searchParams.get('status') === 'APPROVED'));
  });

  it('toArray respeta el límite y deja de pedir páginas', async () => {
    const { w, calls } = harness(pages);
    const all = await w.receivables.list().toArray(3);
    assert.equal(all.length, 3);
    assert.equal(calls.length, 2);
  });

  it('un listado vacío termina sin pedir más', async () => {
    const { w, calls } = harness(() => ({
      items: [],
      meta: { page: 1, pageSize: 25, total: 0, totalPages: 0 },
    }));
    for await (const _ of w.charges.list()) assert.fail('no debía traer nada');
    assert.equal(calls.length, 1);
  });
});

describe('rutas, cuerpos e idempotencia', () => {
  it('un id con caracteres raros va codificado en la ruta', async () => {
    const { w, calls } = harness(() => ({}));
    await w.charges.retrieve('a/../b?x');
    assert.equal(calls[0]!.url.pathname, '/api/v1/charges/a%2F..%2Fb%3Fx');
  });

  it('la llave propia llega tal cual; sin ella, una generada', async () => {
    const { w, calls } = harness(() => ({}));
    await w.receivables.create({} as never, { idempotencyKey: 'factura-2001' });
    await w.subscriptions.pause('sub-1');
    assert.equal(calls[0]!.init.headers['Idempotency-Key'], 'factura-2001');
    assert.match(calls[1]!.init.headers['Idempotency-Key'], /^[0-9a-f-]{36}$/);
  });

  it('el cuerpo va como JSON; anular y pausar no llevan cuerpo', async () => {
    const { w, calls } = harness(() => ({}));
    await w.charges.refunds.create('tx-1', { amount: 10000, reason: 'Parcial' });
    await w.receivables.void('deuda-1');
    assert.deepEqual(JSON.parse(calls[0]!.init.body), { amount: 10000, reason: 'Parcial' });
    assert.equal(calls[1]!.init.body, undefined);
  });

  it('un reembolso sin cuerpo manda {} (reembolso total)', async () => {
    const { w, calls } = harness(() => ({}));
    await w.charges.refunds.create('tx-1');
    assert.equal(calls[0]!.init.body, '{}');
  });

  it('includeInactive solo viaja cuando es true', async () => {
    const { w, calls } = harness(() => []);
    await w.subscriptionPlans.list();
    await w.subscriptionPlans.list({ includeInactive: true });
    assert.equal(calls[0]!.url.search, '');
    assert.equal(calls[1]!.url.searchParams.get('includeInactive'), 'true');
  });

  it('los recursos no muestran la llave al imprimirlos', async () => {
    const { inspect } = await import('node:util');
    const { w } = harness(() => ({}));
    assert.doesNotMatch(inspect(w.charges, { depth: 5 }), /AbCdEfGh/);
    assert.doesNotMatch(JSON.stringify(w.charges), /AbCdEfGh/);
  });
});

describe('casos límite de los recursos', () => {
  it('la idempotencyKey del cuerpo de un cobro se usa como cabecera (no se ignora)', async () => {
    const { w, calls } = harness(() => ({}));
    const body = {
      amount: 50000,
      reference: 'Pedido 1001',
      customerEmail: 'a@ejemplo.test',
      idempotencyKey: 'pedido-1001',
    };
    await w.charges.create(body as never);
    await w.charges.create(body as never);
    assert.equal(calls[0]!.init.headers['Idempotency-Key'], 'pedido-1001');
    assert.equal(calls[1]!.init.headers['Idempotency-Key'], 'pedido-1001');
    assert.equal(JSON.parse(calls[0]!.init.body).idempotencyKey, undefined);
  });

  it('dos llaves distintas (cuerpo y opciones) se rechazan antes de enviar', async () => {
    const { w, calls } = harness(() => ({}));
    await assert.rejects(
      w.charges.create(
        {
          amount: 1000,
          reference: 'r',
          customerEmail: 'a@ejemplo.test',
          idempotencyKey: 'pedido-0001',
        } as never,
        { idempotencyKey: 'pedido-0002' },
      ),
      /distintas/,
    );
    assert.equal(calls.length, 0);
  });

  it('ids vacíos, "." o ".." se rechazan (no cambian la ruta)', async () => {
    const { w, calls } = harness(() => ({}));
    for (const bad of ['', '   ', '.', '..']) {
      await assert.rejects(
        Promise.resolve().then(() => w.receivables.void(bad)),
        /Id inválido/,
      );
      await assert.rejects(
        Promise.resolve().then(() => w.charges.retrieve(bad)),
        /Id inválido/,
      );
    }
    assert.equal(calls.length, 0);
  });

  it('for await termina aunque el API repita siempre la misma página', async () => {
    const { w, calls } = harness(() => ({
      items: [{ id: 'tx-1' }, { id: 'tx-2' }],
      meta: { page: 1, pageSize: 2, total: 6, totalPages: 3 },
    }));
    const ids: string[] = [];
    for await (const tx of w.charges.list()) ids.push((tx as any).id);
    assert.ok(calls.length <= 2, `pidió ${calls.length} páginas`);
    assert.deepEqual(ids, ['tx-1', 'tx-2'], 'la página repetida no se entrega otra vez');
  });

  it('for await termina con un meta sin página o con texto', async () => {
    for (const meta of [
      { pageSize: 2, total: 6, totalPages: 3 },
      { page: '1', pageSize: 2, total: 6, totalPages: 3 },
      { page: 1, pageSize: 2, total: 6 },
    ]) {
      const { w, calls } = harness(() => ({ items: [{ id: 'a' }, { id: 'b' }], meta }));
      for await (const _ of w.receivables.list()) void _;
      assert.ok(calls.length <= 2, `${JSON.stringify(meta)} pidió ${calls.length}`);
    }
  });

  it('una página incompleta es la última', async () => {
    const { w, calls } = harness(() => ({
      items: [{ id: 'a' }],
      meta: { page: 1, pageSize: 25, total: 999, totalPages: 40 },
    }));
    for await (const _ of w.charges.list()) void _;
    assert.equal(calls.length, 1);
  });

  it('toArray exige un límite entero de 1 o más', async () => {
    const { w } = harness(pages);
    for (const bad of [0, -1, Number.NaN, 1.5]) {
      await assert.rejects(w.charges.list().toArray(bad), /limit/);
    }
    assert.equal((await w.charges.list().toArray(1)).length, 1);
  });
});

// Contrato SDK ↔ API: cada operación del OpenAPI público tiene su método
// en el SDK, y ese método llega a la ruta y el verbo correctos. Si el API
// suma una operación, esta prueba falla hasta que el SDK la tenga (y el CI
// la corre: `--filter=@winorapay/node`).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { SPEC } from '../scripts/spec.mjs';
import {
  ChargeRefunds,
  Charges,
  Debtors,
  Receivables,
  SubscriptionPlans,
  Subscriptions,
  Winora,
} from '@winorapay/node';

const spec = JSON.parse(readFileSync(SPEC, 'utf8'));

const ID = '11111111-1111-4111-8111-111111111111';

/** Cómo se llama cada operación desde el SDK. */
const CALLS: Record<string, (w: Winora) => unknown> = {
  getCharges: (w) => w.charges.list(),
  postCharges: (w) =>
    w.charges.create({ amount: 50000, reference: 'Pedido 1001', customerEmail: 'a@ejemplo.test' }),
  getChargesId: (w) => w.charges.retrieve(ID),
  getChargesIdRefunds: (w) => w.charges.refunds.list(ID),
  postChargesIdRefunds: (w) => w.charges.refunds.create(ID, { amount: 10000 }),
  postDebtors: (w) => w.debtors.upsert({ fullName: 'Ana Pérez' } as never),
  getReceivables: (w) => w.receivables.list(),
  postReceivables: (w) => w.receivables.create({} as never),
  getReceivablesId: (w) => w.receivables.retrieve(ID),
  patchReceivablesId: (w) => w.receivables.update(ID, { concept: 'Cuota' } as never),
  postReceivablesIdPayments: (w) => w.receivables.recordPayment(ID, {} as never),
  postReceivablesIdVoid: (w) => w.receivables.void(ID),
  postReceivablesBatch: (w) => w.receivables.createBatch({ items: [] }),
  getSubscriptionPlans: (w) => w.subscriptionPlans.list(),
  postSubscriptionPlans: (w) => w.subscriptionPlans.create({} as never),
  getSubscriptionPlansPlanId: (w) => w.subscriptionPlans.retrieve(ID),
  getSubscriptions: (w) => w.subscriptions.list(),
  postSubscriptions: (w) => w.subscriptions.create({} as never),
  getSubscriptionsSubId: (w) => w.subscriptions.retrieve(ID),
  postSubscriptionsSubIdCancel: (w) => w.subscriptions.cancel(ID),
  postSubscriptionsSubIdChangePlan: (w) => w.subscriptions.changePlan(ID, { newPlanId: ID }),
  getSubscriptionsSubIdInvoices: (w) => w.subscriptions.invoices(ID),
  postSubscriptionsSubIdPause: (w) => w.subscriptions.pause(ID),
  postSubscriptionsSubIdResume: (w) => w.subscriptions.resume(ID),
};

/** El cliente con un fetch falso que responde según la forma de la operación. */
function harness() {
  const calls: Array<{ method: string; url: URL; headers: Record<string, string>; body?: string }> =
    [];
  const fetch = (async (url: string, init: any) => {
    calls.push({ method: init.method, url: new URL(url), headers: init.headers, body: init.body });
    const data =
      init.method === 'GET' && /\/(charges|receivables)$/.test(new URL(url).pathname)
        ? { items: [], meta: { page: 1, pageSize: 25, total: 0, totalPages: 0 } }
        : {};
    return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
  }) as unknown as typeof globalThis.fetch;
  const w = new Winora('wk_test_AbCdEfGhIjKlMnOp1234', {
    fetch,
    baseUrl: 'https://api.ejemplo.test/api/v1',
  });
  return { w, calls };
}

const operations = Object.entries(spec.paths as Record<string, Record<string, any>>).flatMap(
  ([path, methods]) =>
    Object.entries(methods).map(([method, op]) => ({ path, method, id: op.operationId as string })),
);

describe('contrato del SDK con el OpenAPI público', () => {
  it('cada método público de los recursos corresponde a una operación del API', async () => {
    // Se envuelven los métodos de los recursos para ver cuáles usa CALLS. Un
    // método del SDK sin operación en el API (o que CALLS no use) falla aquí.
    const resources = {
      Charges,
      ChargeRefunds,
      Receivables,
      Debtors,
      SubscriptionPlans,
      Subscriptions,
    };
    const all = new Set<string>();
    const used = new Set<string>();
    const restore: Array<() => void> = [];
    for (const [name, cls] of Object.entries(resources)) {
      const proto = cls.prototype as Record<string, unknown>;
      for (const method of Object.getOwnPropertyNames(proto)) {
        const fn = proto[method];
        if (method === 'constructor' || typeof fn !== 'function') continue;
        all.add(`${name}.${method}`);
        proto[method] = function (this: unknown, ...args: unknown[]) {
          used.add(`${name}.${method}`);
          return (fn as (...a: unknown[]) => unknown).apply(this, args);
        };
        restore.push(() => (proto[method] = fn));
      }
    }
    try {
      for (const call of Object.values(CALLS)) await call(harness().w);
    } finally {
      for (const r of restore) r();
    }
    assert.deepEqual([...used].sort(), [...all].sort());
    assert.equal(all.size, operations.length);
  });

  it('cada operación del API tiene su método en el SDK, y no sobra ninguno', () => {
    assert.deepEqual(
      Object.keys(CALLS).sort(),
      operations.map((o) => o.id).sort(),
      'el API y el SDK no coinciden: agrega el método al recurso y a CALLS',
    );
  });

  for (const op of operations) {
    it(`${op.id} → ${op.method.toUpperCase()} ${op.path}`, async () => {
      const { w, calls } = harness();
      await CALLS[op.id]!(w);
      assert.equal(calls.length, 1);
      const call = calls[0]!;
      assert.equal(call.method, op.method.toUpperCase());
      assert.equal(call.url.pathname, `/api/v1${op.path.replace(/\{[^}]+\}/g, ID)}`);
      const write = op.method !== 'get';
      assert.equal(!!call.headers['Idempotency-Key'], write, 'llave solo en escrituras');
    });
  }
});

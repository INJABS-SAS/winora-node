// Verificación de webhooks.
//
// La firma del SDK tiene que aceptar exactamente lo que firma el API,
//   createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')
// con `Winora-Signature: t=<t>,v1=<firma>`, y rechazar todo lo demás sin
// lanzar nada que no sea WinoraSignatureError.
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { SPEC } from '../scripts/spec.mjs';
import { Winora, WinoraSignatureError, webhooks } from '@winorapay/node';

const SECRET = 'whsec_q8XbM3pLz0vR7tKc2Yw9nHs4Ue1Jf6Ga';
const NOW = 1_762_300_000;

/** Lo que hace el API para firmar una entrega. */
function signLikeTheApi(body: string, secret = SECRET, t = NOW) {
  const v1 = createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  return `t=${t},v1=${v1}`;
}

const event = (type: string, data: object) =>
  JSON.stringify({
    id: '0f8fad5b-d9cb-469f-a165-70867728950e',
    type,
    createdAt: '2026-11-05T15:00:00.000Z',
    data,
  });

const BODY = event('payment.approved', {
  transaction: {
    id: '9b4a2c1e-0000-4000-8000-000000000001',
    status: 'APPROVED',
    amount: 50000,
    mode: 'live',
  },
});

const rejects = (fn: () => unknown, code: string) =>
  assert.throws(fn, (e: any) => e instanceof WinoraSignatureError && e.code === code, code);

describe('webhooks.constructEvent', () => {
  it('acepta una entrega firmada como la firma el API y devuelve el evento', () => {
    const ev = webhooks.constructEvent(BODY, signLikeTheApi(BODY), SECRET, { now: NOW });
    assert.equal(ev.type, 'payment.approved');
    if (ev.type === 'payment.approved') assert.equal(ev.data.transaction.amount, 50000);
  });

  it('acepta el cuerpo como Buffer o Uint8Array (express.raw)', () => {
    const header = signLikeTheApi(BODY);
    for (const raw of [Buffer.from(BODY), new TextEncoder().encode(BODY)]) {
      assert.equal(
        webhooks.constructEvent(raw, header, SECRET, { now: NOW }).type,
        'payment.approved',
      );
    }
  });

  it('respeta los acentos y caracteres no ASCII del cuerpo', () => {
    const body = event('receivable.created', {
      receivable: { concept: 'Matrícula año 2027 — ñandú' },
      eventId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    });
    assert.equal(
      webhooks.constructEvent(Buffer.from(body), signLikeTheApi(body), SECRET, { now: NOW }).type,
      'receivable.created',
    );
  });

  it('rechaza otro secreto, un cuerpo alterado o un espacio de más', () => {
    rejects(
      () =>
        webhooks.constructEvent(
          BODY,
          signLikeTheApi(BODY, 'whsec_otro_secreto_de_otro_endpoint'),
          SECRET,
          { now: NOW },
        ),
      'sdk/webhook-signature-mismatch',
    );
    rejects(
      () =>
        webhooks.constructEvent(BODY.replace('50000', '5000000'), signLikeTheApi(BODY), SECRET, {
          now: NOW,
        }),
      'sdk/webhook-signature-mismatch',
    );
    rejects(
      () => webhooks.constructEvent(BODY + ' ', signLikeTheApi(BODY), SECRET, { now: NOW }),
      'sdk/webhook-signature-mismatch',
    );
  });

  it('rechaza una firma vieja o del futuro (repetición) más allá de la tolerancia', () => {
    const old = signLikeTheApi(BODY, SECRET, NOW - 301);
    rejects(
      () => webhooks.constructEvent(BODY, old, SECRET, { now: NOW }),
      'sdk/webhook-signature-expired',
    );
    const future = signLikeTheApi(BODY, SECRET, NOW + 301);
    rejects(
      () => webhooks.constructEvent(BODY, future, SECRET, { now: NOW }),
      'sdk/webhook-signature-expired',
    );
    // Dentro de la tolerancia, y con una tolerancia propia.
    assert.ok(
      webhooks.constructEvent(BODY, signLikeTheApi(BODY, SECRET, NOW - 299), SECRET, { now: NOW }),
    );
    assert.ok(webhooks.constructEvent(BODY, old, SECRET, { now: NOW, toleranceSec: 600 }));
  });

  it('un now que no es número no apaga la ventana de 5 minutos', () => {
    const yearOld = signLikeTheApi(BODY, SECRET, NOW - 365 * 86400);
    for (const now of [NaN, 'abc', Infinity, -1] as any[]) {
      assert.throws(() => webhooks.constructEvent(BODY, yearOld, SECRET, { now }), RangeError);
    }
    // options null = valores por defecto (la firma de NOW ya venció hoy).
    rejects(
      () => webhooks.constructEvent(BODY, yearOld, SECRET, null),
      'sdk/webhook-signature-expired',
    );
  });

  it('una cabecera demasiado larga es malformada, no ausente', () => {
    rejects(
      () => webhooks.constructEvent(BODY, 'x'.repeat(1001), SECRET, { now: NOW }),
      'sdk/webhook-signature-malformed',
    );
  });

  it('generateTestHeader exige un timestamp entero', () => {
    for (const ts of [NaN, 1.5, -1]) {
      assert.throws(() => webhooks.generateTestHeader(BODY, SECRET, ts), RangeError);
    }
    const header = webhooks.generateTestHeader(BODY, SECRET, NOW);
    assert.equal(
      webhooks.constructEvent(BODY, header, SECRET, { now: NOW }).type,
      'payment.approved',
    );
  });

  it('rechaza cabeceras ausentes o malformadas sin lanzar otra cosa', () => {
    const v1 = signLikeTheApi(BODY).split('v1=')[1];
    const cases: Array<[unknown, string]> = [
      [undefined, 'sdk/webhook-signature-missing'],
      [null, 'sdk/webhook-signature-missing'],
      ['', 'sdk/webhook-signature-missing'],
      [`v1=${v1}`, 'sdk/webhook-signature-malformed'],
      [`t=${NOW}`, 'sdk/webhook-signature-malformed'],
      [`t=abc,v1=${v1}`, 'sdk/webhook-signature-malformed'],
      [`t=${NOW},v1=${'é'.repeat(64)}`, 'sdk/webhook-signature-malformed'],
      [`t=${NOW},v1=abc`, 'sdk/webhook-signature-malformed'],
      ['x'.repeat(5000), 'sdk/webhook-signature-malformed'],
    ];
    for (const [header, code] of cases) {
      rejects(() => webhooks.constructEvent(BODY, header as string, SECRET, { now: NOW }), code);
    }
  });

  it('acepta si alguna de varias firmas v1 coincide (rotación de secreto)', () => {
    const good = signLikeTheApi(BODY).split('v1=')[1];
    const header = `t=${NOW},v1=${'0'.repeat(64)},v1=${good}`;
    assert.ok(webhooks.constructEvent(BODY, header, SECRET, { now: NOW }));
  });

  it('un cuerpo ya convertido en objeto da un error que explica qué hacer', () => {
    assert.throws(
      () => webhooks.constructEvent(JSON.parse(BODY), signLikeTheApi(BODY), SECRET, { now: NOW }),
      (e: any) => e.code === 'sdk/webhook-body-not-raw' && /express\.raw/.test(e.message),
    );
  });

  it('un secreto que no es whsec_ se rechaza', () => {
    rejects(
      () => webhooks.constructEvent(BODY, signLikeTheApi(BODY), 'wk_live_esto_es_una_llave_de_api'),
      'sdk/webhook-secret-invalid',
    );
  });

  it('un cuerpo firmado que no es un evento se rechaza', () => {
    for (const body of [
      'no es json',
      '{"hola":1}',
      '{"id":"x","type":"payment.approved","data":null}',
    ]) {
      rejects(
        () => webhooks.constructEvent(body, signLikeTheApi(body), SECRET, { now: NOW }),
        'sdk/webhook-body-invalid',
      );
    }
  });

  it('generateTestHeader produce la misma firma que el API', () => {
    assert.equal(webhooks.generateTestHeader(BODY, SECRET, NOW), signLikeTheApi(BODY));
  });

  it('winora.webhooks es el mismo verificador y no usa la llave de API', () => {
    const w = new Winora('wk_test_AbCdEfGhIjKlMnOp1234');
    assert.equal(
      w.webhooks.constructEvent(BODY, signLikeTheApi(BODY), SECRET, { now: NOW }).type,
      'payment.approved',
    );
  });

  it('acepta un evento de cada uno de los 16 tipos del API', () => {
    const spec = JSON.parse(readFileSync(SPEC, 'utf8'));
    const types = Object.keys(spec.webhooks);
    assert.equal(types.length, 16);
    for (const type of types) {
      const body = event(type, { x: 1 });
      assert.equal(
        webhooks.constructEvent(body, signLikeTheApi(body), SECRET, { now: NOW }).type,
        type,
      );
    }
  });
});

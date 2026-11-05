/**
 * Webhooks: verificar la firma de una entrega de Winora y obtener el evento
 * tipado.
 *
 *   app.post('/winora/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
 *     const event = webhooks.constructEvent(req.body, req.get('Winora-Signature'), secret);
 *     res.sendStatus(200); // 2xx a todo evento, aunque no lo uses
 *     if (event.type === 'payment.approved') entregar(event.data.transaction);
 *   });
 *
 * La firma es la misma del API (`webhooks.service.ts`):
 * `Winora-Signature: t=<unix>,v1=<hex>` con
 * `v1 = HMAC-SHA256(secreto whsec_…, "<t>.<cuerpo crudo>")`, donde `t` es
 * la hora de ESE envío (cambia en cada reintento).
 *
 * No necesita la llave de API: se usa con `webhooks` suelto o con
 * `winora.webhooks`.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { WinoraError } from './errors.js';
import type { webhooks as WebhookPaths } from './generated/openapi.js';

/** Cuerpo de un evento de webhook, según su `type`. */
type PayloadOf<K extends keyof WebhookPaths> =
  NonNullable<WebhookPaths[K]['post']> extends {
    requestBody: { content: { 'application/json': infer B } };
  }
    ? B
    : never;

/**
 * Un evento de Winora. Es una unión por `type`: tras `if (event.type ===
 * 'payment.approved')`, TypeScript sabe que trae `data.transaction`.
 */
export type WinoraEvent = { [K in keyof WebhookPaths]: PayloadOf<K> }[keyof WebhookPaths];

/** El evento de un tipo en particular. */
export type WinoraEventOf<K extends WinoraEvent['type']> = Extract<WinoraEvent, { type: K }>;

/** La firma no sirve: responde 400 y no proceses la entrega. */
export class WinoraSignatureError extends WinoraError {
  constructor(code: string, message: string) {
    super({ status: null, code, message, retryable: false });
    this.name = 'WinoraSignatureError';
  }
}

export interface ConstructEventOptions {
  /** Antigüedad máxima de la firma, en segundos. Por defecto 300 (5 min). */
  toleranceSec?: number;
  /** Hora "actual" en segundos Unix (para pruebas). */
  now?: number;
}

const HEX64 = /^[0-9a-f]{64}$/;

function rawToBuffer(rawBody: unknown): Buffer {
  if (typeof rawBody === 'string') return Buffer.from(rawBody, 'utf8');
  if (rawBody instanceof Uint8Array) return Buffer.from(rawBody);
  throw new WinoraSignatureError(
    'sdk/webhook-body-not-raw',
    'constructEvent necesita el cuerpo CRUDO (string o Buffer), tal como llegó. Si tu framework ya lo convirtió en objeto, la firma no se puede verificar: en Express usa express.raw({ type: "application/json" }) en esta ruta.',
  );
}

function checkSecret(secret: unknown): asserts secret is string {
  if (typeof secret !== 'string' || !secret.startsWith('whsec_') || secret.length < 20) {
    throw new WinoraSignatureError(
      'sdk/webhook-secret-invalid',
      'El secreto del webhook debe ser el whsec_… de ese endpoint (Organización → Webhooks en el panel).',
    );
  }
}

/** `t=…,v1=…[,v1=…]` → { t, firmas }. */
function parseHeader(header: unknown): { t: number; signatures: string[] } {
  if (typeof header !== 'string' || header.length === 0) {
    throw new WinoraSignatureError(
      'sdk/webhook-signature-missing',
      'Falta la cabecera Winora-Signature.',
    );
  }
  if (header.length > 1000) {
    throw new WinoraSignatureError(
      'sdk/webhook-signature-malformed',
      'La cabecera Winora-Signature es demasiado larga.',
    );
  }
  let t: number | undefined;
  const signatures: string[] = [];
  for (const part of header.split(',')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === 't' && /^\d{1,12}$/.test(value)) t = Number(value);
    else if (key === 'v1' && HEX64.test(value)) signatures.push(value);
  }
  if (t === undefined || signatures.length === 0) {
    throw new WinoraSignatureError(
      'sdk/webhook-signature-malformed',
      'La cabecera Winora-Signature no tiene la forma t=<unix>,v1=<hex de 64>.',
    );
  }
  return { t, signatures };
}

function sign(secret: string, t: number, body: Buffer): Buffer {
  return createHmac('sha256', secret).update(`${t}.`).update(body).digest();
}

export class Webhooks {
  /**
   * Verifica la firma y devuelve el evento tipado. Lanza
   * `WinoraSignatureError` si la firma no es de Winora, es de otro secreto,
   * el cuerpo cambió o la firma tiene más de `toleranceSec` (repetición).
   */
  constructEvent(
    rawBody: string | Buffer | Uint8Array,
    signatureHeader: string | null | undefined,
    secret: string,
    options: ConstructEventOptions | null = {},
  ): WinoraEvent {
    const body = rawToBuffer(rawBody);
    checkSecret(secret);
    const { t, signatures } = parseHeader(signatureHeader);
    const tolerance = options?.toleranceSec ?? 300;
    const now = options?.now ?? Math.floor(Date.now() / 1000);
    if (typeof tolerance !== 'number' || !Number.isFinite(tolerance) || tolerance < 0) {
      throw new RangeError('toleranceSec debe ser un número de segundos mayor o igual a 0.');
    }
    // Un `now` que no es número haría que la comparación de abajo nunca
    // fallara: se aceptarían firmas de cualquier antigüedad.
    if (typeof now !== 'number' || !Number.isFinite(now) || now < 0) {
      throw new RangeError('now debe ser la hora en segundos Unix (un número mayor o igual a 0).');
    }

    const expected = sign(secret, t, body);
    const valid = signatures.some((s) => timingSafeEqual(Buffer.from(s, 'hex'), expected));
    if (!valid) {
      throw new WinoraSignatureError(
        'sdk/webhook-signature-mismatch',
        'La firma no corresponde: el cuerpo cambió en el camino, no es el cuerpo crudo, o el secreto es de otro endpoint.',
      );
    }
    if (Math.abs(now - t) > tolerance) {
      throw new WinoraSignatureError(
        'sdk/webhook-signature-expired',
        `La firma tiene más de ${tolerance} segundos: puede ser una entrega repetida por un tercero.`,
      );
    }

    let event: unknown;
    try {
      event = JSON.parse(body.toString('utf8'));
    } catch {
      throw new WinoraSignatureError(
        'sdk/webhook-body-invalid',
        'El cuerpo firmado no es JSON válido.',
      );
    }
    const e = event as { id?: unknown; type?: unknown; data?: unknown };
    if (
      typeof e?.type !== 'string' ||
      typeof e.id !== 'string' ||
      typeof e.data !== 'object' ||
      e.data === null
    ) {
      throw new WinoraSignatureError(
        'sdk/webhook-body-invalid',
        'El cuerpo no tiene la forma de un evento de Winora.',
      );
    }
    return event as WinoraEvent;
  }

  /**
   * Arma una cabecera `Winora-Signature` válida para un cuerpo: sirve para
   * probar tu endpoint sin Winora. `timestamp` en segundos Unix (por
   * defecto, ahora).
   */
  generateTestHeader(
    rawBody: string | Buffer | Uint8Array,
    secret: string,
    timestamp?: number,
  ): string {
    const body = rawToBuffer(rawBody);
    checkSecret(secret);
    const t = timestamp ?? Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(t) || t < 0) {
      throw new RangeError('timestamp debe ser un entero de segundos Unix mayor o igual a 0.');
    }
    return `t=${t},v1=${sign(secret, t, body).toString('hex')}`;
  }
}

/** Para verificar webhooks sin crear un cliente (no necesita la llave de API). */
export const webhooks = new Webhooks();

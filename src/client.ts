/**
 * Cliente HTTP del SDK: autentica, arma la URL, pone la Idempotency-Key en
 * las escrituras, desempaca `{ ok, data }` y aplica la regla de reintentos
 * de `retry.ts`. Usa el `fetch` de Node (18+): sin dependencias.
 */
import { randomUUID } from 'node:crypto';
import { WinoraConfigError, WinoraConnectionError, WinoraError } from './errors.js';
import {
  classifyFetchError,
  parseRetryAfter,
  retryDelayMs,
  shouldRetry,
  type Outcome,
} from './retry.js';
import { VERSION } from './version.js';

export const DEFAULT_BASE_URL = 'https://api.winorapay.com/api/v1';

export interface WinoraOptions {
  /** Por defecto `https://api.winorapay.com/api/v1`. HTTPS obligatorio salvo en localhost. */
  baseUrl?: string;
  /** Tiempo máximo por intento, en ms (1 a 600.000). Por defecto 30 s. */
  timeoutMs?: number;
  /** Reintentos permitidos (0 a 5; ver la regla en la documentación). Por defecto 2. */
  maxNetworkRetries?: number;
  /** Espera base entre reintentos, en ms (crece exponencialmente). Por defecto 500. */
  retryBaseDelayMs?: number;
  /** Un `fetch` propio (proxy, pruebas). Por defecto el global. */
  fetch?: typeof fetch;
}

export type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  /**
   * Llave de idempotencia de esta escritura (8 a 100 caracteres ASCII, sin
   * espacios a los lados). Si no se pasa, el SDK genera una por llamada y la
   * mantiene en sus reintentos.
   */
  idempotencyKey?: string;
}

/** Un `Retry-After` más largo que esto no se espera dentro de la llamada. */
const MAX_WAIT_SEC = 10;
/** Las llaves reales tienen 32 caracteres tras el prefijo; 16 es el mínimo aceptado. */
const KEY_PATTERN = /^wk_(test|live)_[A-Za-z0-9_-]{16,}$/;
const IDEMPOTENCY_KEY = /^[\x21-\x7E](?:[\x20-\x7E]{6,98})[\x21-\x7E]$/;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export class WinoraClient {
  readonly #apiKey: string;
  readonly mode: 'test' | 'live';
  readonly baseUrl: string;
  readonly #timeoutMs: number;
  readonly #maxRetries: number;
  readonly #baseDelayMs: number;
  readonly #fetch: typeof fetch;

  constructor(apiKey: string, options: WinoraOptions = {}) {
    if (typeof apiKey !== 'string' || !KEY_PATTERN.test(apiKey)) {
      throw new WinoraConfigError(
        'La llave de API de Winora debe empezar por wk_test_ (pruebas) o wk_live_ (producción) y venir completa.',
      );
    }
    this.#apiKey = apiKey;
    this.mode = apiKey.startsWith('wk_live_') ? 'live' : 'test';
    this.baseUrl = validBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#timeoutMs = validNumber('timeoutMs', options.timeoutMs ?? 30_000, 1, 600_000);
    this.#maxRetries = validNumber('maxNetworkRetries', options.maxNetworkRetries ?? 2, 0, 5, true);
    this.#baseDelayMs = validNumber('retryBaseDelayMs', options.retryBaseDelayMs ?? 500, 0, 60_000);
    const f = options.fetch ?? globalThis.fetch;
    if (typeof f !== 'function') {
      throw new WinoraConfigError(
        'No hay fetch disponible: usa Node 18 o más, o pasa options.fetch.',
      );
    }
    this.#fetch = f;
  }

  /** La llave enmascarada, para logs: `wk_live_…abcd`. */
  get maskedKey(): string {
    return `wk_${this.mode}_…${this.#apiKey.slice(-4)}`;
  }

  /**
   * Petición cruda a la API. Los recursos (`charges`, `receivables`…) la
   * usan por dentro; sirve también para una ruta que el SDK aún no envuelva.
   */
  async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const verb = method.toUpperCase();
    const write = verb !== 'GET';
    if (write && opts.idempotencyKey !== undefined) validIdempotencyKey(opts.idempotencyKey);
    // Toda escritura sale con llave: así un reintento nunca puede duplicar.
    const idempotencyKey = write ? (opts.idempotencyKey ?? randomUUID()) : undefined;
    const url = this.#url(path, opts.query);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.#apiKey}`,
      Accept: 'application/json',
      'User-Agent': `winorapay-node/${VERSION} node/${process.version}`,
    };
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    const body = opts.body !== undefined ? JSON.stringify(opts.body) : undefined;
    const where = { method: verb, path, idempotencyKey };

    for (let attempt = 0; ; attempt++) {
      const canRetry = attempt < this.#maxRetries;
      let res: Response;
      try {
        res = await this.#fetch(url, {
          method: verb,
          headers,
          body,
          // Una redirección convertiría un POST en GET: mejor fallar.
          redirect: 'error',
          signal: AbortSignal.timeout(this.#timeoutMs),
        });
      } catch (err) {
        const kind = classifyFetchError(err);
        if (kind === 'not-sent') {
          // Con certeza no salió, y repetirla fallaría igual.
          throw new WinoraError({
            ...where,
            status: null,
            code: 'sdk/request-error',
            message: `La petición no se pudo enviar: ${this.#scrub(errMessage(err))}`,
            retryable: false,
          });
        }
        if (kind === 'unknown') {
          // No se sabe si llegó (p. ej. respondió con una redirección): no se
          // repite sola, pero tampoco se afirma que no salió.
          throw new WinoraConnectionError({
            ...where,
            code: 'sdk/unknown-outcome',
            message:
              `Falló la petición sin una respuesta de Winora (${this.#scrub(errMessage(err))})` +
              (write ? `. ${SAME_KEY}` : '. Puedes reintentar.'),
            retryable: true,
          });
        }
        if (canRetry) {
          await sleep(retryDelayMs(attempt + 1, this.#baseDelayMs));
          continue;
        }
        const timeout = err instanceof Error && err.name === 'TimeoutError';
        throw new WinoraConnectionError({
          ...where,
          code: timeout ? 'sdk/timeout' : 'sdk/connection-error',
          message:
            (timeout ? 'Se agotó el tiempo de espera' : 'No se pudo conectar con Winora') +
            (write ? `. ${SAME_KEY}` : '. Puedes reintentar.'),
          retryable: true,
        });
      }

      const requestId = res.headers.get('x-request-id') ?? undefined;
      const payload = await readJson(res);
      if (res.ok && payload?.ok === true) return payload.data as T;

      const fromWinora = payload?.ok === false && typeof payload.error?.code === 'string';
      const outcome: Outcome = {
        kind: 'response',
        status: res.status,
        fromWinora,
        code: fromWinora ? payload!.error!.code : undefined,
        retryAfterSec: parseRetryAfter(res.headers.get('retry-after')),
      };
      const waitTooLong = (outcome.retryAfterSec ?? 0) > MAX_WAIT_SEC;
      if (canRetry && !waitTooLong && shouldRetry(verb, outcome)) {
        await sleep(retryDelayMs(attempt + 1, this.#baseDelayMs, outcome.retryAfterSec));
        continue;
      }
      throw errorFrom(res.status, fromWinora ? payload : null, { ...where, requestId });
    }
  }

  #url(path: string, query?: Query): string {
    const url = new URL(this.baseUrl + (path.startsWith('/') ? path : `/${path}`));
    for (const [k, v] of Object.entries(query ?? {})) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    return url.toString();
  }

  /** Por si un mensaje de error de fetch llegara a repetir la llave. */
  #scrub(text: string): string {
    return text.split(this.#apiKey).join(this.maskedKey);
  }

  // Nunca mostrar la llave al imprimir el cliente (console.log, util.inspect, JSON).
  toJSON() {
    return { mode: this.mode, baseUrl: this.baseUrl, apiKey: this.maskedKey };
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `WinoraClient { mode: '${this.mode}', apiKey: '${this.maskedKey}', baseUrl: '${this.baseUrl}' }`;
  }
}

const SAME_KEY =
  'No se sabe si la operación quedó hecha: repítela con la MISMA idempotencyKey (si llegó, Winora devuelve su resultado en vez de hacerla dos veces).';
const NEW_KEY =
  'El intento quedó registrado como fallido: consulta el estado y, si no quedó hecho, reintenta con una idempotencyKey nueva.';

type Payload = { ok?: boolean; data?: unknown; error?: { code?: string; message?: string } };

async function readJson(res: Response): Promise<Payload | null> {
  try {
    return (await res.json()) as Payload;
  } catch {
    return null;
  }
}

function errorFrom(
  status: number,
  payload: Payload | null,
  where: { method: string; path: string; idempotencyKey?: string; requestId?: string },
): WinoraError {
  const write = where.method !== 'GET';
  if (!payload) {
    // No la escribió Winora: un 5xx del balanceador, o un 2xx que no es JSON.
    // La operación pudo quedar hecha: la salida segura es la misma llave.
    return new WinoraError({
      ...where,
      status,
      code: `http/${status}`,
      message: `Respuesta inesperada (${status}) que no vino de Winora. ${write ? SAME_KEY : 'Puedes reintentar.'}`,
      retryable: true,
    });
  }
  const code = payload.error!.code!;
  let message = payload.error?.message ?? `Winora respondió ${status}`;
  let retryable = false;
  if (status === 429 || code === 'request/in-progress') {
    // La petición no se ejecutó (429) o sigue en curso: repetirla más tarde,
    // con la misma llave, es seguro.
    retryable = true;
  } else if (status >= 500) {
    if (write) message += ` · ${NEW_KEY}`;
    else retryable = true;
  }
  return new WinoraError({ ...where, status, code, message, retryable });
}

function validBaseUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new WinoraConfigError('options.baseUrl no es una URL válida.');
  }
  if (url.search || url.hash || url.username || url.password) {
    throw new WinoraConfigError(
      'options.baseUrl no puede llevar query, fragmento ni usuario: solo el origen y la ruta base.',
    );
  }
  const local = LOCAL_HOSTS.has(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
    throw new WinoraConfigError(
      'options.baseUrl debe ser https (http solo se acepta en localhost): la llave viaja en cada petición.',
    );
  }
  return url.toString().replace(/\/+$/, '');
}

function validNumber(name: string, v: number, min: number, max: number, int = false): number {
  if (
    typeof v !== 'number' ||
    !Number.isFinite(v) ||
    v < min ||
    v > max ||
    (int && !Number.isInteger(v))
  ) {
    throw new WinoraConfigError(
      `options.${name} debe ser un número${int ? ' entero' : ''} entre ${min} y ${max}.`,
    );
  }
  return v;
}

function validIdempotencyKey(key: unknown): void {
  if (typeof key !== 'string' || !IDEMPOTENCY_KEY.test(key)) {
    throw new WinoraConfigError(
      'idempotencyKey debe tener entre 8 y 100 caracteres ASCII visibles, sin espacios al inicio ni al final.',
    );
  }
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Cuándo se repite una petición. La regla sale de cómo se comporta el API
 * (comprobada contra el API):
 *
 *  - Sin respuesta (red, timeout): se repite, en una escritura con la MISMA
 *    `Idempotency-Key`. Es el caso para el que existe la llave: si la
 *    primera sí llegó, Winora devuelve su resultado en vez de hacerla otra vez.
 *  - 5xx SIN el sobre `{ ok: false, error }`: no lo dio Winora sino lo que
 *    está delante (un 502/504 del balanceador o un servidor que se reinició
 *    a mitad de la petición). Para el SDK es "sin respuesta": la operación pudo terminar o
 *    seguir corriendo, así que se repite con la MISMA llave.
 *  - 429: se repite tras esperar `Retry-After` (la petición no se ejecutó),
 *    salvo el bloqueo por intentos fallidos con llaves inválidas.
 *  - 409 `request/in-progress`: la misma llave sigue corriendo; se espera y
 *    se repite con ella.
 *  - 5xx CON sobre, en una lectura: se repite; leer no cambia nada.
 *  - 5xx CON sobre, en una escritura: NO. Winora registró el intento como
 *    fallido y la misma llave devuelve ese fallo (cobro → 409, reembolso
 *    `failed` con ok: true, cartera → request/indeterminate). Hay que
 *    consultar y, si no quedó hecho, usar una llave nueva: lo decide el
 *    integrador.
 *  - Cualquier otro 4xx: nunca.
 */

export type Outcome =
  | { kind: 'network' }
  | {
      kind: 'response';
      status: number;
      /** La respuesta trae el sobre de error de Winora (`{ ok: false, error }`). */
      fromWinora: boolean;
      code?: string;
      retryAfterSec?: number;
    };

export function shouldRetry(method: string, outcome: Outcome): boolean {
  if (outcome.kind === 'network') return true;
  const { status, fromWinora, code } = outcome;
  if (status === 429) return code !== 'api/too-many-failed-attempts';
  if (status === 409 && code === 'request/in-progress') return true;
  if (status >= 500) return !fromWinora || method === 'GET';
  return false;
}

/**
 * Espera antes del intento `attempt` (1 = primer reintento): exponencial con
 * jitter, o lo que diga `Retry-After` si es más.
 */
export function retryDelayMs(attempt: number, baseMs: number, retryAfterSec?: number): number {
  const exp = Math.min(baseMs * 2 ** (attempt - 1), 8_000);
  const jittered = exp * (0.75 + Math.random() * 0.5);
  const fromHeader = retryAfterSec !== undefined ? retryAfterSec * 1000 : 0;
  return Math.max(jittered, fromHeader);
}

/** `Retry-After` en segundos (solo el formato numérico, que es el que manda Winora). */
export function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Códigos de Node/undici que significan "no hubo respuesta". */
const NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ECONNABORTED',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ENETUNREACH',
  'EHOSTUNREACH',
]);

/**
 * Si el error de `fetch` es de red (la petición pudo no llegar o no volver).
 * Lo demás (un header inválido, una redirección, una URL mala) nunca salió
 * o nunca va a funcionar: no se repite.
 */
export function isNetworkError(err: unknown): boolean {
  return classifyFetchError(err) === 'network';
}

/** Códigos que con certeza ocurren antes de enviar nada. */
const NOT_SENT_CODES = new Set([
  'UND_ERR_INVALID_ARG',
  'UND_ERR_NOT_SUPPORTED',
  'ERR_INVALID_URL',
  'ERR_INVALID_ARG_VALUE',
  'ERR_INVALID_ARG_TYPE',
  'ERR_INVALID_HTTP_TOKEN',
  'ERR_INVALID_CHAR',
]);

/**
 * Qué se sabe de una petición cuyo `fetch` lanzó un error:
 *  - `network`: falla de red reconocible; pudo llegar o no → se repite con la
 *    misma llave.
 *  - `not-sent`: con certeza no salió (header inválido, URL mala) → no se
 *    repite: fallaría igual.
 *  - `unknown`: no se sabe (una redirección, un `fetch` propio con otros
 *    errores). No se repite, pero el error NO afirma que no salió: en una
 *    escritura dice "repite con la misma llave".
 *
 * Mira el `code` en el error y en su `cause` (undici lo pone en la causa;
 * node-fetch y otros, arriba).
 */
export function classifyFetchError(err: unknown): 'network' | 'not-sent' | 'unknown' {
  if (!(err instanceof Error)) return 'unknown';
  if (err.name === 'TimeoutError') return 'network';
  const cause = (err as { cause?: { code?: unknown } }).cause;
  const codes = [(err as { code?: unknown }).code, cause?.code].filter(
    (c): c is string => typeof c === 'string',
  );
  if (codes.some((c) => NOT_SENT_CODES.has(c))) return 'not-sent';
  if (codes.some((c) => NETWORK_CODES.has(c) || c.startsWith('UND_ERR_'))) return 'network';
  if (err instanceof TypeError) {
    // `fetch failed` sin causa: el caso común de red caída.
    if (/fetch failed/i.test(err.message)) return cause === undefined ? 'network' : 'unknown';
    // Otro TypeError de fetch (header inválido, cuerpo en un GET): nunca salió.
    return 'not-sent';
  }
  return 'unknown';
}

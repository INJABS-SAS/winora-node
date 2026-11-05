/**
 * Errores del SDK. Todo lo que falla llega como `WinoraError` (o una
 * subclase), con el `code` estable del API para decidir en el código del
 * integrador: `if (e.code === 'payment/invalid-customer-email') …`.
 *
 * Ningún error lleva la llave de API: ni en el mensaje ni en sus campos.
 */

export interface WinoraErrorInit {
  /** HTTP de la respuesta, o `null` si no llegó respuesta (red, timeout). */
  status: number | null;
  /** Código estable del API (`payment/invalid-customer-email`) o del SDK (`sdk/…`). */
  code: string;
  /** Mensaje en español. */
  message: string;
  /**
   * Si repetir la MISMA petición, tal cual, tiene sentido. Es `false` en toda
   * escritura que recibió un 5xx: el intento ya quedó registrado como fallido
   * y repetirlo con la misma `Idempotency-Key` devuelve ese fallo.
   */
  retryable: boolean;
  /** La `Idempotency-Key` que se mandó (en escrituras), para consultar o reintentar. */
  idempotencyKey?: string;
  /** `X-Request-Id` de la respuesta: dáselo a soporte de Winora. */
  requestId?: string;
  method?: string;
  path?: string;
}

export class WinoraError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly retryable: boolean;
  readonly idempotencyKey?: string;
  readonly requestId?: string;
  readonly method?: string;
  readonly path?: string;

  constructor(init: WinoraErrorInit) {
    super(init.message);
    this.name = 'WinoraError';
    this.status = init.status;
    this.code = init.code;
    this.retryable = init.retryable;
    this.idempotencyKey = init.idempotencyKey;
    this.requestId = init.requestId;
    this.method = init.method;
    this.path = init.path;
  }
}

/**
 * No llegó respuesta (red caída o timeout). En una escritura NO se sabe si
 * quedó hecha: repítela con la MISMA `idempotencyKey` (viene en el error) y
 * Winora devuelve lo que pasó en vez de hacerla dos veces.
 */
export class WinoraConnectionError extends WinoraError {
  constructor(init: Omit<WinoraErrorInit, 'status'>) {
    super({ ...init, status: null });
    this.name = 'WinoraConnectionError';
  }
}

/**
 * La llave, una opción del cliente o un argumento (p. ej. una
 * `idempotencyKey` vacía) no sirven. Se lanza antes de enviar nada.
 */
export class WinoraConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WinoraConfigError';
  }
}

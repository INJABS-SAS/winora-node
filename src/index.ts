/**
 * @winorapay/node — SDK oficial de Winora para Node.js.
 *
 *   import { Winora } from '@winorapay/node';
 *   const winora = new Winora(process.env.WINORA_API_KEY!);
 *
 *   const { checkoutUrl } = await winora.charges.create({ … });
 *   for await (const tx of winora.charges.list({ status: 'APPROVED' })) { … }
 *
 *   const event = winora.webhooks.constructEvent(rawBody, firma, secreto);
 *
 * Cada recurso cubre su grupo de la API; `winora.request()` sirve para
 * cualquier ruta. Para verificar webhooks sin la llave de API, importa
 * `webhooks` directamente.
 */
import { WinoraClient, type RequestOptions, type WinoraOptions } from './client.js';
import { Charges, Debtors, Receivables, SubscriptionPlans, Subscriptions } from './resources.js';
import { webhooks, type Webhooks } from './webhooks.js';

export class Winora {
  readonly #client: WinoraClient;
  /** Cobros y sus reembolsos (`charges.refunds`). */
  readonly charges: Charges;
  /** Cartera: deudas con su link de pago. */
  readonly receivables: Receivables;
  /** Deudores de cartera. */
  readonly debtors: Debtors;
  /** Planes de suscripción (módulo de Suscripciones). */
  readonly subscriptionPlans: SubscriptionPlans;
  /** Suscripciones (módulo de Suscripciones). */
  readonly subscriptions: Subscriptions;
  /** Verificar la firma de un webhook y obtener el evento tipado. */
  readonly webhooks: Webhooks = webhooks;

  constructor(apiKey: string, options?: WinoraOptions) {
    this.#client = new WinoraClient(apiKey, options);
    this.charges = new Charges(this.#client);
    this.receivables = new Receivables(this.#client);
    this.debtors = new Debtors(this.#client);
    this.subscriptionPlans = new SubscriptionPlans(this.#client);
    this.subscriptions = new Subscriptions(this.#client);
  }

  /** `test` (wk_test_…) o `live` (wk_live_…): lo decide la llave. */
  get mode(): 'test' | 'live' {
    return this.#client.mode;
  }

  /**
   * Petición directa a la API, con la misma autenticación, errores y
   * reintentos que el resto del SDK. Devuelve `data` ya desempacado.
   */
  request<T = unknown>(method: string, path: string, options?: RequestOptions): Promise<T> {
    return this.#client.request<T>(method, path, options);
  }

  toJSON() {
    return this.#client.toJSON();
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `Winora { mode: '${this.#client.mode}', apiKey: '${this.#client.maskedKey}' }`;
  }
}

export { DEFAULT_BASE_URL } from './client.js';
export { PageRequest } from './pagination.js';
export {
  ChargeRefunds,
  Charges,
  Debtors,
  Receivables,
  SubscriptionPlans,
  Subscriptions,
} from './resources.js';
export type { ChargeCreateParams, ChargeListParams, WriteOptions } from './resources.js';
export { Webhooks, WinoraSignatureError, webhooks } from './webhooks.js';
export type { ConstructEventOptions, WinoraEvent, WinoraEventOf } from './webhooks.js';
export type { Query, RequestOptions, WinoraOptions } from './client.js';
export { WinoraConfigError, WinoraConnectionError, WinoraError } from './errors.js';
export type { WinoraErrorInit } from './errors.js';
export { VERSION } from './version.js';
export type * from './types.js';
export default Winora;

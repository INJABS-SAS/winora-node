/**
 * Los recursos de la API, uno por grupo de la referencia. Cada método es
 * una operación del OpenAPI público (su operationId va en el comentario);
 * una prueba de contrato falla si el API tiene una operación sin método.
 *
 * Las escrituras aceptan `{ idempotencyKey }`: sin ella el SDK genera una
 * por llamada. Pasa la tuya (p. ej. el número de pedido) si tu sistema
 * puede repetir la operación desde cero.
 */
import type { WinoraClient } from './client.js';
import { WinoraConfigError } from './errors.js';
import { PageRequest } from './pagination.js';
import type {
  BodyOf,
  Charge,
  Debtor,
  Page,
  QueryOf,
  Receivable,
  ReceivablesBatchResult,
  Refund,
  Subscription,
  SubscriptionInvoice,
  SubscriptionPlan,
  Transaction,
  Without,
} from './types.js';

/** Opciones de una escritura. */
export interface WriteOptions {
  /** 8 a 100 caracteres. Repetirla devuelve el resultado original. */
  idempotencyKey?: string;
}

/**
 * Un id como segmento de ruta. `encodeURIComponent` no codifica los puntos,
 * y `new URL` resuelve `.` y `..`: `void('..')` terminaba en `POST /void`, y
 * `retrieve('')` en el listado (con otro tipo de respuesta).
 */
function seg(id: unknown): string {
  if (typeof id !== 'string' || id.trim() === '' || id === '.' || id === '..') {
    throw new WinoraConfigError(
      `Id inválido: ${JSON.stringify(id)}. Usa el id que devolvió Winora.`,
    );
  }
  return encodeURIComponent(id);
}

/**
 * Crear un cobro. Sin `mode` (lo define la llave) ni `idempotencyKey` en el
 * cuerpo: la llave va en el segundo argumento, `{ idempotencyKey }`.
 */
export type ChargeCreateParams = Without<BodyOf<'postCharges'>, 'mode' | 'idempotencyKey'>;
/** Filtros del listado de cobros (sin `mode`: lo define la llave). */
export type ChargeListParams = Without<QueryOf<'getCharges'>, 'mode'>;

abstract class Resource {
  constructor(protected readonly client: WinoraClient) {}

  protected get<T>(path: string, query?: object): Promise<T> {
    return this.client.request<T>('GET', path, { query: query as never });
  }

  protected write<T>(
    method: 'POST' | 'PATCH',
    path: string,
    body: unknown,
    opts?: WriteOptions,
  ): Promise<T> {
    return this.client.request<T>(method, path, { body, idempotencyKey: opts?.idempotencyKey });
  }

  protected paged<T>(path: string, query: { page?: number } & object = {}): PageRequest<T> {
    return new PageRequest<T>(
      (page) => this.get<Page<T>>(path, { ...query, page }),
      query.page ?? 1,
    );
  }
}

/** Reembolsos de un cobro (`charges.refunds`). */
export class ChargeRefunds extends Resource {
  /**
   * Reembolso total o parcial. Ojo: sin `amount` reembolsa TODO el saldo
   * que queda. · postChargesIdRefunds
   */
  async create(
    chargeId: string,
    body: BodyOf<'postChargesIdRefunds'> = {},
    opts?: WriteOptions,
  ): Promise<Refund> {
    return this.write('POST', `/charges/${seg(chargeId)}/refunds`, body, opts);
  }

  /** Reembolsos del cobro. Revisa `status`: `ok` no basta. · getChargesIdRefunds */
  async list(chargeId: string): Promise<Refund[]> {
    return this.get(`/charges/${seg(chargeId)}/refunds`);
  }
}

/** Cobros: crear uno devuelve el link del checkout alojado. */
export class Charges extends Resource {
  readonly refunds: ChargeRefunds;

  constructor(client: WinoraClient) {
    super(client);
    this.refunds = new ChargeRefunds(client);
  }

  /** Crea el cobro; redirige a `checkoutUrl`. · postCharges */
  async create(body: ChargeCreateParams, opts?: WriteOptions): Promise<Charge> {
    // El API acepta la llave también en el cuerpo, pero le gana la cabecera
    // (que el SDK siempre manda): una llave en el cuerpo se ignoraba y un
    // reintento desde cero creaba otro cobro. Se usa como cabecera.
    const { idempotencyKey: bodyKey, ...rest } = body as ChargeCreateParams & {
      idempotencyKey?: unknown;
    };
    if (
      bodyKey !== undefined &&
      opts?.idempotencyKey !== undefined &&
      bodyKey !== opts.idempotencyKey
    ) {
      throw new WinoraConfigError(
        'La idempotencyKey del cuerpo y la de las opciones son distintas: pasa una sola, en { idempotencyKey }.',
      );
    }
    return this.write('POST', '/charges', rest, {
      idempotencyKey: opts?.idempotencyKey ?? (bodyKey as string | undefined),
    });
  }

  /** Estado actual de un cobro. · getChargesId */
  async retrieve(id: string): Promise<Transaction> {
    return this.get(`/charges/${seg(id)}`);
  }

  /** Listado con filtros; `await` da una página, `for await` recorre todas. · getCharges */
  list(query: ChargeListParams = {}): PageRequest<Transaction> {
    return this.paged('/charges', query);
  }
}

/** Cartera: deudas con su link de pago. */
export class Receivables extends Resource {
  /** Crea una deuda (con su deudor). · postReceivables */
  async create(body: BodyOf<'postReceivables'>, opts?: WriteOptions): Promise<Receivable> {
    return this.write('POST', '/receivables', body, opts);
  }

  /** Hasta 200 deudas; el resultado dice cuál quedó. · postReceivablesBatch */
  async createBatch(
    body: BodyOf<'postReceivablesBatch'>,
    opts?: WriteOptions,
  ): Promise<ReceivablesBatchResult> {
    return this.write('POST', '/receivables/batch', body, opts);
  }

  /** · getReceivablesId */
  async retrieve(id: string): Promise<Receivable> {
    return this.get(`/receivables/${seg(id)}`);
  }

  /** · getReceivables */
  list(query: QueryOf<'getReceivables'> = {}): PageRequest<Receivable> {
    return this.paged('/receivables', query);
  }

  /** Corrige una deuda pendiente (al menos un campo). · patchReceivablesId */
  async update(
    id: string,
    body: BodyOf<'patchReceivablesId'>,
    opts?: WriteOptions,
  ): Promise<Receivable> {
    return this.write('PATCH', `/receivables/${seg(id)}`, body, opts);
  }

  /** Anula una deuda pendiente: el link deja de cobrar. · postReceivablesIdVoid */
  async void(id: string, opts?: WriteOptions): Promise<Receivable> {
    return this.write('POST', `/receivables/${seg(id)}/void`, undefined, opts);
  }

  /** Registra un pago recibido por fuera de Winora. · postReceivablesIdPayments */
  async recordPayment(
    id: string,
    body: BodyOf<'postReceivablesIdPayments'>,
    opts?: WriteOptions,
  ): Promise<Receivable> {
    return this.write('POST', `/receivables/${seg(id)}/payments`, body, opts);
  }
}

/** Deudores de cartera. */
export class Debtors extends Resource {
  /** Crea el deudor, o trae el que ya existe con ese documento. · postDebtors */
  async upsert(body: BodyOf<'postDebtors'>, opts?: WriteOptions): Promise<Debtor> {
    return this.write('POST', '/debtors', body, opts);
  }
}

/** Planes de suscripción (requiere el módulo activo). */
export class SubscriptionPlans extends Resource {
  /** `amountMinor` en pesos enteros, a pesar del nombre. · postSubscriptionPlans */
  async create(
    body: BodyOf<'postSubscriptionPlans'>,
    opts?: WriteOptions,
  ): Promise<SubscriptionPlan> {
    return this.write('POST', '/subscription-plans', body, opts);
  }

  /** · getSubscriptionPlansPlanId */
  async retrieve(planId: string): Promise<SubscriptionPlan> {
    return this.get(`/subscription-plans/${seg(planId)}`);
  }

  /** Los planes activos; con `includeInactive: true`, también los desactivados. · getSubscriptionPlans */
  async list(options: { includeInactive?: boolean } = {}): Promise<SubscriptionPlan[]> {
    return this.get('/subscription-plans', {
      includeInactive: options.includeInactive ? 'true' : undefined,
    });
  }
}

/** Suscripciones (requiere el módulo activo). */
export class Subscriptions extends Resource {
  /** Con una tarjeta ya guardada; lo normal es la página alojada /subscribe/<planId>. · postSubscriptions */
  async create(body: BodyOf<'postSubscriptions'>, opts?: WriteOptions): Promise<Subscription> {
    return this.write('POST', '/subscriptions', body, opts);
  }

  /** · getSubscriptionsSubId */
  async retrieve(subId: string): Promise<Subscription> {
    return this.get(`/subscriptions/${seg(subId)}`);
  }

  /** · getSubscriptions */
  async list(query: QueryOf<'getSubscriptions'> = {}): Promise<Subscription[]> {
    return this.get('/subscriptions', query);
  }

  /** Cobros de la suscripción. · getSubscriptionsSubIdInvoices */
  async invoices(subId: string): Promise<SubscriptionInvoice[]> {
    return this.get(`/subscriptions/${seg(subId)}/invoices`);
  }

  /** · postSubscriptionsSubIdPause */
  async pause(subId: string, opts?: WriteOptions): Promise<Subscription> {
    return this.write('POST', `/subscriptions/${seg(subId)}/pause`, undefined, opts);
  }

  /** · postSubscriptionsSubIdResume */
  async resume(subId: string, opts?: WriteOptions): Promise<Subscription> {
    return this.write('POST', `/subscriptions/${seg(subId)}/resume`, undefined, opts);
  }

  /** Por defecto al final del período pagado (`atPeriodEnd: true`). · postSubscriptionsSubIdCancel */
  async cancel(
    subId: string,
    body: BodyOf<'postSubscriptionsSubIdCancel'> = {},
    opts?: WriteOptions,
  ): Promise<Subscription> {
    return this.write('POST', `/subscriptions/${seg(subId)}/cancel`, body, opts);
  }

  /** Aplica desde el próximo período, sin prorrateo. · postSubscriptionsSubIdChangePlan */
  async changePlan(
    subId: string,
    body: BodyOf<'postSubscriptionsSubIdChangePlan'>,
    opts?: WriteOptions,
  ): Promise<Subscription> {
    return this.write('POST', `/subscriptions/${seg(subId)}/change-plan`, body, opts);
  }
}

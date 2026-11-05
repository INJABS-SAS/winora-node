/**
 * Nombres cortos para los tipos del OpenAPI público (generados en
 * `generated/openapi.ts`). Así el integrador escribe `Transaction` y no
 * `components['schemas']['Transaction']`.
 */
import type { components, operations, webhooks } from './generated/openapi.js';

type Schemas = components['schemas'];

export type Charge = Schemas['Charge'];
export type Transaction = Schemas['Transaction'];
export type Refund = Schemas['Refund'];
export type Receivable = Schemas['Receivable'];
export type ReceivablesBatchResult = Schemas['ReceivablesBatchResult'];
export type Debtor = Schemas['Debtor'];
export type SubscriptionPlan = Schemas['SubscriptionPlan'];
export type Subscription = Schemas['Subscription'];
export type SubscriptionInvoice = Schemas['SubscriptionInvoice'];
export type PageMeta = Schemas['PageMeta'];

/** Página de resultados de un listado. */
export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

/** Cuerpo de entrada de una operación (por su operationId). */
export type BodyOf<Op extends keyof operations> = operations[Op] extends {
  requestBody?: { content: { 'application/json': infer B } };
}
  ? B
  : never;

/** Filtros (query) de una operación. */
export type QueryOf<Op extends keyof operations> = operations[Op] extends {
  parameters: { query?: infer Q };
}
  ? NonNullable<Q>
  : never;

/**
 * `Omit` que conserva los campos conocidos. Los cuerpos generados traen una
 * firma de índice (aceptan campos de más), y con ella `Omit` borraba todos
 * los campos conocidos: el tipo aceptaba cualquier cosa.
 */
export type Without<T, K extends PropertyKey> = {
  [P in keyof T as P extends K ? never : string extends P ? never : P]: T[P];
};

/** Un evento de webhook, por su tipo (`payment.approved`…). */
export type WebhookEventType = keyof webhooks;

export type { components, operations, webhooks };

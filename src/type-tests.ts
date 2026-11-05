/**
 * Pruebas de tipos: no se ejecutan ni se publican (no las importa
 * index.ts); `tsc --noEmit` las compila. Si un tipo del OpenAPI cambia de
 * forma incompatible, el typecheck del paquete falla aquí.
 */
import type { BodyOf, Charge, QueryOf, Subscription, Transaction } from './types.js';

type Assert<T extends true> = T;
type Has<T, K extends PropertyKey> = K extends keyof T ? true : false;

// Un cobro creado trae la transacción y el link del checkout.
export type _Charge = Assert<Has<Charge, 'checkoutUrl'>> & Assert<Has<Charge, 'transaction'>>;

// La transacción trae lo que un integrador usa para conciliar.
export type _Tx = Assert<Has<Transaction, 'status'>> &
  Assert<Has<Transaction, 'amount'>> &
  Assert<Has<Transaction, 'mode'>>;

// La suscripción ya no trae la llave del portal del cliente.
export type _Sub = Assert<Has<Subscription, 'manageToken'> extends false ? true : false>;

// Crear un cobro exige monto, referencia y correo.
type ChargeBody = BodyOf<'postCharges'>;
export type _Body = Assert<
  {
    amount: number;
    reference: string;
    customerEmail: string;
  } extends Pick<ChargeBody, 'amount' | 'reference' | 'customerEmail'>
    ? true
    : false
>;

// Listar cobros acepta el filtro de estado.
export type _Query = Assert<Has<QueryOf<'getCharges'>, 'status'>>;

// ── Recursos: TypeScript ataja los errores antes de llegar al API ──
import { Winora } from './index.js';

export async function _recursos(w: Winora) {
  // @ts-expect-error — crear un cobro exige monto, referencia y correo.
  await w.charges.create({ amount: 50000 });
  // @ts-expect-error — el filtro `estado` no existe (es `status`).
  w.charges.list({ estado: 'APPROVED' });
  // @ts-expect-error — un estado que el API no tiene.
  w.charges.list({ status: 'PAGADO' });
  // @ts-expect-error — cambiar de plan exige newPlanId.
  await w.subscriptions.changePlan('sub-1', {});

  const page = await w.charges.list({ status: 'APPROVED', pageSize: 50 });
  const tx: Transaction | undefined = page.items[0];
  const charge: Charge = await w.charges.create(
    { amount: 50000, reference: 'Pedido 1001', customerEmail: 'a@ejemplo.test' },
    { idempotencyKey: 'pedido-1001' },
  );
  for await (const t of w.receivables.list({ status: 'open' })) void t.balance;
  void tx;
  void charge.checkoutUrl;
}

// ── Webhooks: eventos tipados por `type` ──
import type { WinoraEvent, WinoraEventOf } from './webhooks.js';

// Los 16 eventos del API están en la unión.
type AllTypes =
  | 'payment.approved'
  | 'payment.declined'
  | 'payment.voided'
  | 'payment.error'
  | 'payment.refunded'
  | 'receivable.created'
  | 'receivable.partially_paid'
  | 'receivable.paid'
  | 'receivable.overdue'
  | 'receivable.voided'
  | 'receivable.reopened'
  | 'subscription.created'
  | 'subscription.charged'
  | 'subscription.payment_failed'
  | 'subscription.payment_method_required'
  | 'subscription.canceled';
export type _AllEvents = Assert<
  [AllTypes] extends [WinoraEvent['type']]
    ? [WinoraEvent['type']] extends [AllTypes]
      ? true
      : false
    : false
>;

export function _narrowing(event: WinoraEvent) {
  if (event.type === 'payment.approved') {
    const amount: number = event.data.transaction.amount;
    void amount;
    // @ts-expect-error — un pago no trae `receivable`.
    void event.data.receivable;
  }
  if (event.type === 'receivable.paid') {
    const id: string = event.data.eventId;
    void id;
  }
  const charged: WinoraEventOf<'subscription.charged'> | undefined = undefined;
  void charged;
}

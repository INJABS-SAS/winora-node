// GENERADO por scripts/generar-tipos.mjs desde el OpenAPI público. No editar a mano.
/* eslint-disable */
export interface paths {
    "/charges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar transacciones (filtros + paginación) */
        get: operations["getCharges"];
        put?: never;
        /** Crear un cobro (devuelve el link de pago alojado) */
        post: operations["postCharges"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charges/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Consultar una transacción */
        get: operations["getChargesId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charges/{id}/refunds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar reembolsos de un cobro */
        get: operations["getChargesIdRefunds"];
        put?: never;
        /** Reembolsar un cobro (total o parcial) */
        post: operations["postChargesIdRefunds"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/debtors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crear un deudor (o traer el que ya existe con ese documento) */
        post: operations["postDebtors"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/receivables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar deudas (por referencia, estado, documento o vencimiento) */
        get: operations["getReceivables"];
        put?: never;
        /** Crear una deuda (con su deudor) y obtener su link de pago */
        post: operations["postReceivables"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/receivables/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Consultar una deuda */
        get: operations["getReceivablesId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Corregir una deuda pendiente (concepto, referencia, monto, vencimiento…) */
        patch: operations["patchReceivablesId"];
        trace?: never;
    };
    "/receivables/{id}/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registrar un pago recibido por fuera de Winora */
        post: operations["postReceivablesIdPayments"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/receivables/{id}/void": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Anular una deuda pendiente (el link deja de cobrar) */
        post: operations["postReceivablesIdVoid"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/receivables/batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crear varias deudas (hasta 200); el resultado dice cuál quedó */
        post: operations["postReceivablesBatch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscription-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar planes del comercio */
        get: operations["getSubscriptionPlans"];
        put?: never;
        /** Crear plan de suscripción */
        post: operations["postSubscriptionPlans"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscription-plans/{planId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle de plan */
        get: operations["getSubscriptionPlansPlanId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar suscripciones del comercio */
        get: operations["getSubscriptions"];
        put?: never;
        /** Crear una suscripción con una tarjeta ya guardada */
        post: operations["postSubscriptions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/{subId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle de suscripción */
        get: operations["getSubscriptionsSubId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/{subId}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancelar suscripción */
        post: operations["postSubscriptionsSubIdCancel"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/{subId}/change-plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cambiar plan (aplica al próximo período) */
        post: operations["postSubscriptionsSubIdChangePlan"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/{subId}/invoices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Historial de cobros de la suscripción */
        get: operations["getSubscriptionsSubIdInvoices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/{subId}/pause": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Pausar suscripción */
        post: operations["postSubscriptionsSubIdPause"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/{subId}/resume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reanudar suscripción */
        post: operations["postSubscriptionsSubIdResume"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export interface webhooks {
    "payment.approved": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento payment.approved
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookPaymentApproved"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "payment.declined": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento payment.declined
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookPaymentDeclined"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "payment.error": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento payment.error
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookPaymentError"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "payment.refunded": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento payment.refunded
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookPaymentRefunded"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "payment.voided": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento payment.voided
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookPaymentVoided"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "receivable.created": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento receivable.created
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookReceivableCreated"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "receivable.overdue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento receivable.overdue
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookReceivableOverdue"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "receivable.paid": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento receivable.paid
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookReceivablePaid"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "receivable.partially_paid": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento receivable.partially_paid
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookReceivablePartiallyPaid"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "receivable.reopened": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento receivable.reopened
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookReceivableReopened"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "receivable.voided": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento receivable.voided
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookReceivableVoided"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "subscription.canceled": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento subscription.canceled
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookSubscriptionCanceled"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "subscription.charged": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento subscription.charged
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookSubscriptionCharged"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "subscription.created": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento subscription.created
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookSubscriptionCreated"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "subscription.payment_failed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento subscription.payment_failed
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookSubscriptionPaymentFailed"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "subscription.payment_method_required": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Evento subscription.payment_method_required
         * @description Winora hace POST a cada endpoint configurado en el panel. Verifica la cabecera `Winora-Signature` con el cuerpo crudo y responde 2xx a todo evento, aunque no lo uses: cualquier otra respuesta se reintenta.
         */
        post: operations["webhookSubscriptionPaymentMethodRequired"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export interface components {
    schemas: {
        Charge: {
            transaction: {
                /** Format: uuid */
                id: string;
                provider: string;
                amount: number;
                currency: string;
                reference: string;
                description: string | null;
                /** @enum {string} */
                status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "REFUNDED" | "EXPIRED" | "ABANDONED";
                checkoutState: ("OPENED" | "PAYMENT_SUBMITTED" | "PAYMENT_ABORTED" | "LEFT_BY_PAYER") | null;
                checkoutOpenedAt: string | null;
                checkoutSubmittedAt: string | null;
                checkoutLeftAt: string | null;
                paymentMethod: ("card" | "pse" | "nequi" | "daviplata" | "transfiya" | "efecty" | "bancolombia" | "cash") | null;
                providerTxId: string | null;
                customerEmail: string | null;
                customerFirstName: string | null;
                customerLastName: string | null;
                customerDocType: ("CC" | "NIT" | "CE" | "TI" | "PP") | null;
                customerDocNumber: string | null;
                customerPhone: string | null;
                customerCity: string | null;
                customerAddress: string | null;
                authNumber: string | null;
                cardBrand: string | null;
                cardLast4: string | null;
                cus: string | null;
                bank: string | null;
                detailedStatus: string | null;
                acquirerResponseCode: string | null;
                acquirerResponseMessage: string | null;
                cardPan: string | null;
                cardType: string | null;
                cardCountry: string | null;
                installments: number | null;
                ipAddress: string | null;
                refundedAmount: number;
                winoraFee: number | null;
                returnUrl: string | null;
                /** @enum {string} */
                mode: "test" | "live";
                /** @enum {string} */
                source: "link" | "token" | "api" | "plugin" | "checkout";
                createdAt: string;
                updatedAt: string;
            } & {
                [key: string]: unknown;
            };
            /** Format: uri */
            checkoutUrl: string;
        };
        Transaction: {
            /** Format: uuid */
            id: string;
            provider: string;
            amount: number;
            currency: string;
            reference: string;
            description: string | null;
            /** @enum {string} */
            status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "REFUNDED" | "EXPIRED" | "ABANDONED";
            checkoutState: ("OPENED" | "PAYMENT_SUBMITTED" | "PAYMENT_ABORTED" | "LEFT_BY_PAYER") | null;
            checkoutOpenedAt: string | null;
            checkoutSubmittedAt: string | null;
            checkoutLeftAt: string | null;
            paymentMethod: ("card" | "pse" | "nequi" | "daviplata" | "transfiya" | "efecty" | "bancolombia" | "cash") | null;
            providerTxId: string | null;
            customerEmail: string | null;
            customerFirstName: string | null;
            customerLastName: string | null;
            customerDocType: ("CC" | "NIT" | "CE" | "TI" | "PP") | null;
            customerDocNumber: string | null;
            customerPhone: string | null;
            customerCity: string | null;
            customerAddress: string | null;
            authNumber: string | null;
            cardBrand: string | null;
            cardLast4: string | null;
            cus: string | null;
            bank: string | null;
            detailedStatus: string | null;
            acquirerResponseCode: string | null;
            acquirerResponseMessage: string | null;
            cardPan: string | null;
            cardType: string | null;
            cardCountry: string | null;
            installments: number | null;
            ipAddress: string | null;
            refundedAmount: number;
            winoraFee: number | null;
            returnUrl: string | null;
            /** @enum {string} */
            mode: "test" | "live";
            /** @enum {string} */
            source: "link" | "token" | "api" | "plugin" | "checkout";
            createdAt: string;
            updatedAt: string;
        };
        Refund: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            transactionId: string;
            amount: number;
            reason: string | null;
            /** @enum {string} */
            status: "pending" | "approved" | "failed";
            providerRefundId: string | null;
            createdAt: string;
        };
        Receivable: {
            /** Format: uuid */
            id: string;
            externalRef: string | null;
            concept: string;
            amount: number;
            chargesTotal: number;
            balance: number;
            currency: string;
            dueDate: string;
            /** @enum {string} */
            status: "open" | "partially_paid" | "paid" | "voided";
            overdue: boolean;
            /** @enum {string} */
            mode: "test" | "live";
            project: string | null;
            debtor: {
                /** Format: uuid */
                id: string;
                fullName: string;
                docType: ("CC" | "NIT" | "CE" | "TI" | "PP") | null;
                docNumber: string | null;
                email: string | null;
                phone: string | null;
            } & {
                [key: string]: unknown;
            };
            form: ({
                /** Format: uuid */
                id: string;
                name: string;
                answers: ({
                    label: string;
                    value: string;
                } & {
                    [key: string]: unknown;
                })[];
            } & {
                [key: string]: unknown;
            }) | null;
            payUrl: string | null;
            paidAt: string | null;
            voidedAt: string | null;
            createdAt: string;
        };
        ReceivablesBatchResult: {
            created: number;
            failed: number;
            items: (({
                index: number;
                /** @constant */
                ok: true;
                receivable: {
                    /** Format: uuid */
                    id: string;
                    externalRef: string | null;
                    concept: string;
                    amount: number;
                    chargesTotal: number;
                    balance: number;
                    currency: string;
                    dueDate: string;
                    /** @enum {string} */
                    status: "open" | "partially_paid" | "paid" | "voided";
                    overdue: boolean;
                    /** @enum {string} */
                    mode: "test" | "live";
                    project: string | null;
                    debtor: {
                        /** Format: uuid */
                        id: string;
                        fullName: string;
                        docType: ("CC" | "NIT" | "CE" | "TI" | "PP") | null;
                        docNumber: string | null;
                        email: string | null;
                        phone: string | null;
                    } & {
                        [key: string]: unknown;
                    };
                    form: ({
                        /** Format: uuid */
                        id: string;
                        name: string;
                        answers: ({
                            label: string;
                            value: string;
                        } & {
                            [key: string]: unknown;
                        })[];
                    } & {
                        [key: string]: unknown;
                    }) | null;
                    payUrl: string | null;
                    paidAt: string | null;
                    voidedAt: string | null;
                    createdAt: string;
                } & {
                    [key: string]: unknown;
                };
            } & {
                [key: string]: unknown;
            }) | ({
                index: number;
                /** @constant */
                ok: false;
                error: {
                    code: string;
                    message: string;
                } & {
                    [key: string]: unknown;
                };
            } & {
                [key: string]: unknown;
            }))[];
        };
        Debtor: {
            /** Format: uuid */
            id: string;
            fullName: string;
            docType: ("CC" | "NIT" | "CE" | "TI" | "PP") | null;
            docNumber: string | null;
            email: string | null;
            phone: string | null;
            statementUrl: string;
        };
        SubscriptionPlan: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            orgId: string;
            name: string;
            description: string | null;
            /** @description Pesos colombianos enteros (no centavos), a pesar del nombre. */
            amountMinor: number;
            currency: string;
            /** @enum {string} */
            interval: "day" | "week" | "month" | "year";
            intervalCount: number;
            active: boolean;
            allowedMethods: string[];
            createdAt: string;
            updatedAt: string;
        };
        Subscription: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            orgId: string;
            /** Format: uuid */
            planId: string;
            /** @enum {string} */
            status: "active" | "past_due" | "paused" | "canceled";
            /** Format: email */
            customerEmail: string;
            customerFirstName: string | null;
            customerLastName: string | null;
            customerPhone: string | null;
            customerDocType: string | null;
            customerDocNumber: string | null;
            paymentTokenId: string | null;
            /** @enum {string} */
            mode: "test" | "live";
            currentPeriodStart: string;
            currentPeriodEnd: string;
            nextBillingDate: string;
            cancelAtPeriodEnd: boolean;
            canceledAt: string | null;
            failedAttemptCount: number;
            pastDueSince: string | null;
            createdAt: string;
            updatedAt: string;
        };
        SubscriptionInvoice: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            subscriptionId: string;
            periodStart: string;
            periodEnd: string;
            /** @description Pesos colombianos enteros (no centavos), a pesar del nombre. */
            amountMinor: number;
            currency: string;
            /** @enum {string} */
            status: "pending" | "paid" | "failed" | "voided";
            transactionId: string | null;
            attemptCount: number;
            nextAttemptAt: string | null;
            lastError: string | null;
            createdAt: string;
            updatedAt: string;
        };
        PageMeta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
        Error: {
            /** @constant */
            ok: false;
            error: {
                /** @description Código estable para decidir en tu código, p. ej. `payment/invalid-customer-email`. */
                code: string;
                /** @description Mensaje en español, apto para mostrar. */
                message: string;
            };
        };
    };
    responses: {
        /** @description Datos inválidos o un dato que hay que corregir (no reintentar sin cambiarlo). */
        E400: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Falta la llave de API o no es válida. */
        E401: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description La cuenta no puede operar (en revisión, suspendida o cerrada) o el módulo no está activo. */
        E403: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description No existe, o no es de tu cuenta. */
        E404: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Conflicto con el estado actual del recurso. */
        E409: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Conflicto con el estado actual, o una Idempotency-Key reutilizada con otros datos. */
        E409Idempotent: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Demasiadas peticiones: espera y reintenta. */
        E429: {
            headers: {
                /** @description Segundos a esperar antes de repetir la petición. */
                "Retry-After"?: number;
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Error de Winora o de la pasarela: puedes reintentar. */
        E5XXRead: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Error de Winora o de la pasarela. El intento quedó registrado como fallido: repetirlo con la misma Idempotency-Key devuelve ese fallo. Consulta el estado y, si no quedó hecho, reintenta con una llave nueva. (La misma llave sirve cuando no recibiste respuesta: red caída o timeout). */
        E5XXIdempotent: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Error de Winora o de la pasarela. Esta operación no acepta Idempotency-Key: no reintentes a ciegas, consulta primero si se creó. */
        E5XXNotIdempotent: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getCharges: {
        parameters: {
            query?: {
                status?: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "REFUNDED" | "EXPIRED" | "ABANDONED";
                q?: string;
                /** @description En la API pública se ignora: el modo lo define la llave (wk_test_ / wk_live_). */
                mode?: "test" | "live";
                method?: "card" | "pse" | "nequi" | "daviplata" | "transfiya" | "efecty" | "bancolombia" | "cash";
                source?: "link" | "token" | "api" | "plugin" | "checkout";
                dateFrom?: string;
                dateTo?: string;
                amountMin?: number;
                amountMax?: number;
                page?: number;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: {
                            items: components["schemas"]["Transaction"][];
                            meta: components["schemas"]["PageMeta"];
                        };
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    postCharges: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                    amount: number;
                    /**
                     * @default COP
                     * @enum {string}
                     */
                    currency?: "COP";
                    /**
                     * @description En la API pública se ignora: el modo lo define la llave (wk_test_ / wk_live_).
                     * @enum {string}
                     */
                    mode?: "test" | "live";
                    reference: string;
                    description?: string;
                    /** Format: email */
                    customerEmail: string;
                    customerFirstName?: string;
                    customerLastName?: string;
                    /** @enum {string} */
                    customerDocType?: "CC" | "NIT" | "CE" | "TI" | "PP";
                    customerDocNumber?: string;
                    customerPhone?: string;
                    customerCity?: string;
                    customerAddress?: string;
                    idempotencyKey?: string;
                    saveCard?: boolean;
                    /** Format: uuid */
                    paymentTokenId?: string;
                    /** Format: uri */
                    returnUrl?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Charge"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    getChargesId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Transaction"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    getChargesIdRefunds: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Refund"][];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    postChargesIdRefunds: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                    amount?: number;
                    reason?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Refund"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    postDebtors: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    fullName: string;
                    /** @enum {string} */
                    docType?: "CC" | "NIT" | "CE" | "TI" | "PP";
                    docNumber?: string;
                    /** Format: email */
                    email?: string;
                    phone?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Debtor"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    getReceivables: {
        parameters: {
            query?: {
                externalRef?: string;
                status?: "open" | "partially_paid" | "paid" | "voided";
                debtorDoc?: string;
                dueFrom?: string;
                dueTo?: string;
                page?: number;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: {
                            items: components["schemas"]["Receivable"][];
                            meta: components["schemas"]["PageMeta"];
                        };
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    postReceivables: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    debtor: {
                        fullName: string;
                        /** @enum {string} */
                        docType?: "CC" | "NIT" | "CE" | "TI" | "PP";
                        docNumber?: string;
                        /** Format: email */
                        email?: string;
                        phone?: string;
                    } & {
                        [key: string]: unknown;
                    };
                    projectCode?: string;
                    concept: string;
                    externalRef?: string;
                    /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                    amount: number;
                    dueDate: string;
                    lateTiers?: ({
                        offsetDays: number;
                        /** @enum {string} */
                        kind: "fixed" | "percent";
                        value: number;
                    } & {
                        [key: string]: unknown;
                    })[];
                    amountOptions?: ({
                        label: string;
                        /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                        amount: number;
                    } & {
                        [key: string]: unknown;
                    })[];
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Receivable"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    getReceivablesId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Receivable"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    patchReceivablesId: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    concept?: string;
                    externalRef?: string | null;
                    /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                    amount?: number;
                    dueDate?: string;
                    lateTiers?: ({
                        offsetDays: number;
                        /** @enum {string} */
                        kind: "fixed" | "percent";
                        value: number;
                    } & {
                        [key: string]: unknown;
                    })[];
                    amountOptions?: ({
                        label: string;
                        /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                        amount: number;
                    } & {
                        [key: string]: unknown;
                    })[];
                    projectCode?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Receivable"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    postReceivablesIdPayments: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                    amount: number;
                    /** @enum {string} */
                    method: "cash" | "transfer" | "deposit" | "card_terminal" | "other";
                    paidOn: string;
                    note?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Receivable"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    postReceivablesIdVoid: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Receivable"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    postReceivablesBatch: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    items: ({
                        debtor: {
                            fullName: string;
                            /** @enum {string} */
                            docType?: "CC" | "NIT" | "CE" | "TI" | "PP";
                            docNumber?: string;
                            /** Format: email */
                            email?: string;
                            phone?: string;
                        } & {
                            [key: string]: unknown;
                        };
                        projectCode?: string;
                        concept: string;
                        externalRef?: string;
                        /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                        amount: number;
                        dueDate: string;
                        lateTiers?: ({
                            offsetDays: number;
                            /** @enum {string} */
                            kind: "fixed" | "percent";
                            value: number;
                        } & {
                            [key: string]: unknown;
                        })[];
                        amountOptions?: ({
                            label: string;
                            /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                            amount: number;
                        } & {
                            [key: string]: unknown;
                        })[];
                    } & {
                        [key: string]: unknown;
                    })[];
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["ReceivablesBatchResult"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    getSubscriptionPlans: {
        parameters: {
            query?: {
                includeInactive?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["SubscriptionPlan"][];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    postSubscriptionPlans: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    description?: string;
                    /** @description Pesos colombianos enteros (no centavos): 50000 son $50.000. */
                    amountMinor: number;
                    /** @default COP */
                    currency?: string;
                    /** @enum {string} */
                    interval: "day" | "week" | "month" | "year";
                    /** @default 1 */
                    intervalCount?: number;
                    /**
                     * @default [
                     *       "card"
                     *     ]
                     */
                    allowedMethods?: string[];
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["SubscriptionPlan"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    getSubscriptionPlansPlanId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                planId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["SubscriptionPlan"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    getSubscriptions: {
        parameters: {
            query?: {
                planId?: string;
                status?: "active" | "past_due" | "paused" | "canceled";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Subscription"][];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    postSubscriptions: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    planId: string;
                    /** Format: email */
                    customerEmail: string;
                    customerFirstName?: string;
                    customerLastName?: string;
                    customerPhone?: string;
                    customerDocType?: string;
                    customerDocNumber?: string;
                    /**
                     * Format: uuid
                     * @description Tarjeta ya guardada del cliente en Winora. Sin ella la suscripción no tiene con qué cobrarse: lo normal es que el cliente se suscriba en la página alojada /subscribe/<planId>.
                     */
                    paymentTokenId?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Subscription"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    getSubscriptionsSubId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Subscription"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    postSubscriptionsSubIdCancel: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                subId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @default true */
                    atPeriodEnd?: boolean;
                    reason?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Subscription"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    postSubscriptionsSubIdChangePlan: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                subId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uuid */
                    newPlanId: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Subscription"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    getSubscriptionsSubIdInvoices: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["SubscriptionInvoice"][];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXRead"];
        };
    };
    postSubscriptionsSubIdPause: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                subId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Subscription"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    postSubscriptionsSubIdResume: {
        parameters: {
            query?: never;
            header?: {
                /** @description Recomendada en toda escritura. Repetir la petición con la misma llave devuelve el mismo resultado en vez de crear otro. */
                "Idempotency-Key"?: string;
            };
            path: {
                subId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        ok: true;
                        data: components["schemas"]["Subscription"];
                    };
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409Idempotent"];
            429: components["responses"]["E429"];
            "5XX": components["responses"]["E5XXIdempotent"];
        };
    };
    webhookPaymentApproved: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "payment.approved";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "payment.approved";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        transaction: components["schemas"]["Transaction"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookPaymentDeclined: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "payment.declined";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "payment.declined";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        transaction: components["schemas"]["Transaction"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookPaymentError: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "payment.error";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "payment.error";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        transaction: components["schemas"]["Transaction"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookPaymentRefunded: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "payment.refunded";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "payment.refunded";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        transaction: components["schemas"]["Transaction"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookPaymentVoided: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "payment.voided";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "payment.voided";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        transaction: components["schemas"]["Transaction"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookReceivableCreated: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "receivable.created";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "receivable.created";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        receivable: components["schemas"]["Receivable"];
                        /**
                         * Format: uuid
                         * @description Id del cambio en el historial de la deuda. Es el mismo en cada reintento: úsalo para descartar repetidos.
                         */
                        eventId: string;
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookReceivableOverdue: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "receivable.overdue";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "receivable.overdue";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        receivable: components["schemas"]["Receivable"];
                        /**
                         * Format: uuid
                         * @description Id del cambio en el historial de la deuda. Es el mismo en cada reintento: úsalo para descartar repetidos.
                         */
                        eventId: string;
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookReceivablePaid: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "receivable.paid";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "receivable.paid";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        receivable: components["schemas"]["Receivable"];
                        /**
                         * Format: uuid
                         * @description Id del cambio en el historial de la deuda. Es el mismo en cada reintento: úsalo para descartar repetidos.
                         */
                        eventId: string;
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookReceivablePartiallyPaid: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "receivable.partially_paid";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "receivable.partially_paid";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        receivable: components["schemas"]["Receivable"];
                        /**
                         * Format: uuid
                         * @description Id del cambio en el historial de la deuda. Es el mismo en cada reintento: úsalo para descartar repetidos.
                         */
                        eventId: string;
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookReceivableReopened: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "receivable.reopened";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "receivable.reopened";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        receivable: components["schemas"]["Receivable"];
                        /**
                         * Format: uuid
                         * @description Id del cambio en el historial de la deuda. Es el mismo en cada reintento: úsalo para descartar repetidos.
                         */
                        eventId: string;
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookReceivableVoided: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "receivable.voided";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "receivable.voided";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        receivable: components["schemas"]["Receivable"];
                        /**
                         * Format: uuid
                         * @description Id del cambio en el historial de la deuda. Es el mismo en cada reintento: úsalo para descartar repetidos.
                         */
                        eventId: string;
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookSubscriptionCanceled: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "subscription.canceled";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "subscription.canceled";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        subscription: components["schemas"]["Subscription"];
                        invoice?: components["schemas"]["SubscriptionInvoice"];
                        plan?: components["schemas"]["SubscriptionPlan"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookSubscriptionCharged: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "subscription.charged";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "subscription.charged";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        subscription: components["schemas"]["Subscription"];
                        invoice?: components["schemas"]["SubscriptionInvoice"];
                        plan?: components["schemas"]["SubscriptionPlan"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookSubscriptionCreated: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "subscription.created";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "subscription.created";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        subscription: components["schemas"]["Subscription"];
                        invoice?: components["schemas"]["SubscriptionInvoice"];
                        plan?: components["schemas"]["SubscriptionPlan"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookSubscriptionPaymentFailed: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "subscription.payment_failed";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "subscription.payment_failed";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        subscription: components["schemas"]["Subscription"];
                        invoice?: components["schemas"]["SubscriptionInvoice"];
                        plan?: components["schemas"]["SubscriptionPlan"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    webhookSubscriptionPaymentMethodRequired: {
        parameters: {
            query?: never;
            header: {
                /** @description `t=<unix>,v1=<hex>`: v1 = HMAC-SHA256(secreto `whsec_…`, `<t>.<cuerpo crudo>`). */
                "Winora-Signature": string;
                /** @description El tipo de evento, igual a `type` en el cuerpo. */
                "Winora-Event": "subscription.payment_method_required";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * Format: uuid
                     * @description Id de la entrega.
                     */
                    id: string;
                    /** @constant */
                    type: "subscription.payment_method_required";
                    /** Format: date-time */
                    createdAt: string;
                    data: {
                        subscription: components["schemas"]["Subscription"];
                        invoice?: components["schemas"]["SubscriptionInvoice"];
                        plan?: components["schemas"]["SubscriptionPlan"];
                    };
                };
            };
        };
        responses: {
            /** @description Recibido. Cualquier otro código se reintenta. */
            "2XX": {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}

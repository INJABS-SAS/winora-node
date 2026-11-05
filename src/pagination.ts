/**
 * Listados paginados (`charges.list`, `receivables.list`).
 *
 *   const page = await winora.charges.list({ status: 'APPROVED' });  // una página
 *   for await (const tx of winora.charges.list({ status: 'APPROVED' })) { … }  // todas
 *
 * `await` trae la página pedida (por defecto la 1); `for await` recorre
 * todas desde ella, pidiendo la siguiente solo cuando hace falta.
 *
 * Es paginación por número de página: si el conjunto cambia mientras lo
 * recorres (cobros que pasan de PENDING a APPROVED), se pueden saltar o
 * repetir elementos. Para conciliar, filtra por fechas cerradas o vuelve a
 * consultar cada cobro.
 */
import { WinoraConfigError } from './errors.js';
import type { Page } from './types.js';

type Fetcher<T> = (page: number) => Promise<Page<T>>;

export class PageRequest<T> implements PromiseLike<Page<T>>, AsyncIterable<T> {
  readonly #fetchPage: Fetcher<T>;
  readonly #startPage: number;
  #first: Promise<Page<T>> | null = null;

  constructor(fetchPage: Fetcher<T>, startPage = 1) {
    this.#fetchPage = fetchPage;
    this.#startPage = startPage;
  }

  /** La página pedida. Se pide una sola vez aunque se espere varias veces. */
  #firstPage(): Promise<Page<T>> {
    this.#first ??= this.#fetchPage(this.#startPage);
    return this.#first;
  }

  then<R1 = Page<T>, R2 = never>(
    onFulfilled?: ((value: Page<T>) => R1 | PromiseLike<R1>) | null,
    onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return this.#firstPage().then(onFulfilled, onRejected);
  }

  /**
   * El número de página lo lleva el SDK, no el servidor: una respuesta con
   * la misma página repetida o un `meta` raro no puede dejar el bucle
   * pidiendo para siempre. Se detiene en la última página que anunció la
   * primera respuesta, con una página incompleta o vacía, o si el servidor
   * devuelve una página distinta a la pedida.
   */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let requested = this.#startPage;
    let page = await this.#firstPage();
    const lastPage = Number(page.meta?.totalPages);
    const pageSize = Number(page.meta?.pageSize);
    for (;;) {
      // Una página siguiente que no es la pedida (el servidor repitió una) se
      // descarta antes de entregar nada: no se repiten elementos.
      if (requested !== this.#startPage && Number(page.meta?.page) !== requested) return;
      yield* page.items;
      const done =
        page.items.length === 0 ||
        Number(page.meta?.page) !== requested ||
        !Number.isFinite(lastPage) ||
        requested >= lastPage ||
        (Number.isFinite(pageSize) && page.items.length < pageSize);
      if (done) return;
      requested += 1;
      page = await this.#fetchPage(requested);
    }
  }

  /** Hasta `limit` elementos en un arreglo (por defecto 10.000). */
  async toArray(limit = 10_000): Promise<T[]> {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new WinoraConfigError('toArray(limit): limit debe ser un entero mayor o igual a 1.');
    }
    const out: T[] = [];
    for await (const item of this) {
      out.push(item);
      if (out.length >= limit) break;
    }
    return out;
  }
}

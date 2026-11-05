// Los tipos del SDK (src/generated/openapi.ts) son exactamente los que salen
// del OpenAPI público. Si el API cambia y nadie regenera, falla:
// `npm run gen:types` (o pnpm).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
// @ts-expect-error — script .mjs sin tipos.
import { generar, OUT } from '../scripts/generar-tipos.mjs';

describe('tipos generados', () => {
  it('están al día con el OpenAPI público', async () => {
    assert.equal(
      readFileSync(OUT, 'utf8'),
      await generar(),
      'tipos desactualizados: corre `npm run gen:types` (o pnpm)',
    );
  });
});

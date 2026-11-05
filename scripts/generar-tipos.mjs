// Genera src/generated/openapi.ts desde el OpenAPI público del API
// (apps/admin/public/docs/openapi.json). Los tipos del SDK salen de ahí:
// no hay una segunda fuente que se pueda desalinear.
//
// Uso: npm run gen:types (en el monorepo: pnpm --filter @winorapay/node gen:types)
// Una prueba (src/tipos.test.ts) falla si el archivo quedó viejo.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import { SPEC } from './spec.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export { SPEC };
export const OUT = resolve(here, '../src/generated/openapi.ts');

const HEADER =
  '// GENERADO por scripts/generar-tipos.mjs desde el OpenAPI público. No editar a mano.\n' +
  '/* eslint-disable */\n';

export async function generar() {
  const ast = await openapiTS(JSON.parse(readFileSync(SPEC, 'utf8')));
  return HEADER + astToString(ast);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeFileSync(OUT, await generar());
  console.log(`Tipos escritos en ${OUT}`);
}

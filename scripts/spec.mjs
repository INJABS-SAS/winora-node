// Dónde está el OpenAPI público del que salen los tipos y la prueba de
// contrato. En el monorepo es el que publica el panel
// (apps/admin/public/docs/openapi.json); en el repo público (winora-node)
// va una copia en la raíz del paquete, `openapi.json`, que pone el espejo.
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const copia = resolve(pkg, 'openapi.json');
const monorepo = resolve(pkg, '../../apps/admin/public/docs/openapi.json');

export const SPEC = existsSync(copia) ? copia : monorepo;

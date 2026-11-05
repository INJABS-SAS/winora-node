// El paquete tal como lo ve un proyecto que lo instala: sus tipos compilan
// con `node16` en CommonJS (p. ej. NestJS) y en ESM, y con `bundler`.
// Antes, `exports` mandaba a los dos al mismo `.d.ts` (ESM) y un `.cts`
// daba TS1479.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, describe, it } from 'node:test';

const pkgDir = resolve(import.meta.dirname, '..');
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

// Un proyecto aparte con el paquete "instalado" (package.json + dist).
const project = mkdtempSync(join(tmpdir(), 'winorapay-consumidor-'));
const installed = join(project, 'node_modules', '@winorapay', 'node');
mkdirSync(installed, { recursive: true });
cpSync(join(pkgDir, 'package.json'), join(installed, 'package.json'));
cpSync(join(pkgDir, 'dist'), join(installed, 'dist'), { recursive: true });
// Un proyecto Node real tiene @types/node: los tipos del SDK usan fetch/Response.
mkdirSync(join(project, 'node_modules', '@types'), { recursive: true });
symlinkSync(
  realpathSync(join(pkgDir, 'node_modules', '@types', 'node')),
  join(project, 'node_modules', '@types', 'node'),
  'junction',
);
after(() => rmSync(project, { recursive: true, force: true }));

const USE = `
const winora = new Winora('wk_test_AbCdEfGhIjKlMnOp1234');
const mode: 'test' | 'live' = winora.mode;
const tx: Transaction | undefined = undefined;
function handle(e: unknown) { if (e instanceof WinoraError) { const c: string = e.code; void c; } }
void mode; void tx; void handle;
`;

function compile(file: string, source: string, options: string[]) {
  writeFileSync(join(project, file), source);
  try {
    execFileSync(
      process.execPath,
      [tsc, '--noEmit', '--strict', '--target', 'es2022', ...options, file],
      {
        cwd: project,
        stdio: 'pipe',
      },
    );
  } catch (e: any) {
    assert.fail(`${file} no compila:\n${e.stdout?.toString() ?? ''}${e.stderr?.toString() ?? ''}`);
  }
}

describe('el paquete visto desde un proyecto que lo instala', () => {
  it('CommonJS con node16 (NestJS)', () => {
    compile(
      'uso.cts',
      `import { Winora, WinoraError, type Transaction } from '@winorapay/node';\n${USE}`,
      ['--module', 'node16', '--moduleResolution', 'node16', '--types', 'node'],
    );
  });

  it('ESM con node16', () => {
    compile(
      'uso.mts',
      `import { Winora, WinoraError, type Transaction } from '@winorapay/node';\n${USE}`,
      ['--module', 'node16', '--moduleResolution', 'node16', '--types', 'node'],
    );
  });

  it('bundler (Next, Vite)', () => {
    compile(
      'uso-bundler.ts',
      `import { Winora, WinoraError, type Transaction } from '@winorapay/node';\n${USE}`,
      ['--module', 'esnext', '--moduleResolution', 'bundler', '--types', 'node'],
    );
  });

  it('require() en ejecución da la misma clase que import', () => {
    const cjs = createRequire(join(project, 'x.cjs'))('@winorapay/node');
    assert.equal(typeof cjs.Winora, 'function');
    assert.equal(new cjs.Winora('wk_live_AbCdEfGhIjKlMnOp1234').mode, 'live');
  });
});

/**
 * Node loader for `cli.ts`. The browser modules under `client/` import each
 * other as `./x.js` — what the dev server serves — so a `resolve` hook maps
 * those onto the `.ts` sources Node 24 strips types from natively.
 */
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/^\.{1,2}\//.test(specifier) && specifier.endsWith('.js')) {
      const url = new URL(`${specifier.slice(0, -3)}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(url))) {
        return { url: url.href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});

/**
 * Node `--import` hook for `astryx theme build`: loads every `.css` import as
 * an empty module. The theme recipe imports `backend.ai-ui`, whose dist pulls
 * in ui-common components that import their own stylesheets, and Node cannot
 * load `.css`. The recipe reads none of them.
 *
 *   NODE_OPTIONS="--import=<repo>/scripts/astryx-theme-css-stub.mjs" \
 *     pnpm exec astryx theme build …
 */
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, nextLoad) {
  if (url.endsWith(".css")) {
    return { format: "module", source: "", shortCircuit: true };
  }
  return nextLoad(url, context);
}
`),
);

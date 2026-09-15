/**
 * The stop manifest the implementing session writes, validated before a
 * browser is launched. Caps mirror `react/vite-plugins/review-overlay/client/
 * stop-guard.ts`, which is what actually strips a stop field in-page;
 * `manifest.test.mjs` fails when the two drift.
 */

export const STOP_TEXT_MAX = 280;
export const STOP_LITERAL_MAX = 40;
export const STOP_KIND_MAX = 64;
export const CODE_PATH_MAX = 256;
export const CODE_REFS_MAX = 3;
export const VIA_MAX = 8;
export const VIA_TEXT_MAX = 120;

/** A walkthrough a reader will not finish is not a walkthrough (FR-3945). */
export const MAX_STOPS = 20;

const isInt = (v) => typeof v === "number" && Number.isInteger(v) && v > 0;
/**
 * No control character survives: `ch`/`ck`/`old`/`new`/`label` are rendered
 * straight into a PR comment, and a newline in one of them could forge a
 * `> 📍` block or a `<!-- bai-review` marker the resolver would act on.
 */
const CONTROL_RE = /[\u0000-\u001f\u007f]/;
const isText = (v, max) =>
  typeof v === "string" && !!v && v.length <= max && !CONTROL_RE.test(v);

function checkCode(refs, where, errors) {
  if (!Array.isArray(refs) || refs.length === 0)
    return errors.push(`${where}: code must be a non-empty array`);
  if (refs.length > CODE_REFS_MAX)
    errors.push(`${where}: code holds at most ${CODE_REFS_MAX} refs`);
  refs.forEach((ref, i) => {
    const at = `${where}.code[${i}]`;
    if (!ref || typeof ref !== "object")
      return errors.push(`${at}: not an object`);
    if (!isText(ref.path, CODE_PATH_MAX))
      errors.push(`${at}: path is required`);
    if (!isInt(ref.line)) errors.push(`${at}: line must be a positive integer`);
    if (ref.to !== undefined && !(isInt(ref.to) && ref.to >= ref.line))
      errors.push(`${at}: to must be an integer >= line`);
  });
}

function checkVia(via, where, errors) {
  if (!Array.isArray(via)) return errors.push(`${where}: via must be an array`);
  if (via.length > VIA_MAX)
    errors.push(`${where}: via holds at most ${VIA_MAX} steps`);
  via.forEach((step, i) => {
    const at = `${where}.via[${i}]`;
    const click = step && typeof step === "object" ? step.click : null;
    if (!click || typeof click !== "object")
      return errors.push(`${at}: only {click: {...}} steps are replayable`);
    if (click.text === undefined && click.tid === undefined)
      errors.push(`${at}: click needs text or tid`);
    for (const key of ["text", "tid"]) {
      if (click[key] !== undefined && !isText(click[key], VIA_TEXT_MAX))
        errors.push(`${at}: click.${key} must be 1-${VIA_TEXT_MAX} chars`);
    }
  });
}

function checkStop(stop, index, errors) {
  const where = `stop ${index + 1}`;
  if (!stop || typeof stop !== "object")
    return errors.push(`${where}: not an object`);
  if (typeof stop.route !== "string" || !/^\/(?![/\\])/.test(stop.route))
    errors.push(`${where}: route must be an origin-relative path like "/data"`);
  const find = stop.find;
  if (!find || typeof find !== "object")
    errors.push(`${where}: find is required`);
  else if (
    !isText(find.testid, VIA_TEXT_MAX) &&
    !isText(find.selector, CODE_PATH_MAX) &&
    !isText(find.text, VIA_TEXT_MAX)
  )
    errors.push(`${where}: find needs a testid, a selector or a text`);
  if (!isText(stop.ch, STOP_TEXT_MAX))
    errors.push(`${where}: ch is required (<= ${STOP_TEXT_MAX} chars)`);
  if (!isText(stop.ck, STOP_TEXT_MAX))
    errors.push(`${where}: ck is required (<= ${STOP_TEXT_MAX} chars)`);
  for (const key of ["old", "new"]) {
    if (stop[key] !== undefined && !isText(stop[key], STOP_LITERAL_MAX))
      errors.push(`${where}: ${key} must be 1-${STOP_LITERAL_MAX} chars`);
  }
  if (
    stop.type !== undefined &&
    stop.type !== "added" &&
    stop.type !== "modified"
  )
    errors.push(`${where}: type must be "added" or "modified"`);
  if (stop.kind !== undefined && !isText(stop.kind, STOP_KIND_MAX))
    errors.push(`${where}: kind must be 1-${STOP_KIND_MAX} chars`);
  if (stop.label !== undefined && !isText(stop.label, STOP_TEXT_MAX))
    errors.push(`${where}: label must be 1-${STOP_TEXT_MAX} chars`);
  if (stop.code !== undefined) checkCode(stop.code, where, errors);
  if (stop.via !== undefined) checkVia(stop.via, where, errors);
}

/** `{stops: [...]}` or a bare array; throws with every problem at once. */
export function parseManifest(input) {
  const doc = typeof input === "string" ? JSON.parse(input) : input;
  const stops = Array.isArray(doc) ? doc : doc?.stops;
  const errors = [];
  if (!Array.isArray(stops) || stops.length === 0)
    throw new Error(
      'manifest: expected a non-empty array of stops (or {"stops": [...]})',
    );
  if (stops.length > MAX_STOPS)
    errors.push(
      `manifest: ${stops.length} stops, the cap is ${MAX_STOPS} — group them`,
    );
  stops.forEach((stop, i) => checkStop(stop, i, errors));
  if (errors.length) throw new Error(`manifest:\n  ${errors.join("\n  ")}`);
  return stops;
}

/** The `**bold**` head of the comment's list item, when the manifest names none. */
export function stopLabel(stop, anchor) {
  if (stop.label) return stop.label;
  const page = (stop.route.split("/").filter(Boolean).pop() ?? "app").replace(
    /-/g,
    " ",
  );
  const parts = [page.charAt(0).toUpperCase() + page.slice(1)];
  if (anchor?.tid) parts.push(anchor.tid);
  const tag = anchor?.tag ?? "element";
  parts.push(anchor?.txt ? `${tag} "${anchor.txt}"` : tag);
  return parts.join(" › ");
}

/**
 * The project-scoped prefix every route in the manifest hangs off: what the
 * app redirected to after login, cut back to its `/project/<name>` head.
 */
export function projectBasePath(pathname) {
  const match = /^\/project\/[^/]+/.exec(pathname || "");
  return match ? match[0] : "";
}

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
export const I18N_LANGS_MAX = 4;

/** `ko`, `en`, `pt-BR` — mirrors `LANG_RE` in stop-guard.ts. */
const LANG_RE = /^[a-z]{2}(-[A-Za-z]{2,4})?$/;

/**
 * The PR comment prints a stop's base fields, so they are English; Korean is
 * the one translation, a toggle away in the popover.
 */
export const STOP_LNG = "en";
export const STOP_TRANSLATIONS = ["ko"];

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

/** A `fill` value travels in a public PR comment: never into one of these. */
const SECRET_FIELD_RE =
  /pass(word|wd|code)?|secret|token|api[-_ ]?key|credential|private[-_ ]?key/i;

function checkVia(via, where, errors) {
  if (!Array.isArray(via)) return errors.push(`${where}: via must be an array`);
  if (via.length > VIA_MAX)
    errors.push(`${where}: via holds at most ${VIA_MAX} steps`);
  via.forEach((step, i) => {
    const at = `${where}.via[${i}]`;
    const kinds =
      step && typeof step === "object" && !Array.isArray(step)
        ? Object.keys(step)
        : [];
    const kind = kinds[0];
    if (kinds.length !== 1 || !["click", "fill", "select"].includes(kind))
      return errors.push(
        `${at}: a step is exactly one replayable {click}, {fill} or {select}`,
      );
    const body = step[kind];
    if (!body || typeof body !== "object")
      return errors.push(`${at}: ${kind} must be an object`);
    const name = kind === "click" ? "text" : "label";
    if (body[name] === undefined && body.tid === undefined)
      errors.push(`${at}: ${kind} needs ${name} or tid`);
    const words = { click: [], fill: ["value"], select: ["option"] }[kind];
    for (const key of ["tid", name, ...words]) {
      if (body[key] !== undefined && !isText(body[key], VIA_TEXT_MAX))
        errors.push(`${at}: ${kind}.${key} must be 1-${VIA_TEXT_MAX} chars`);
    }
    for (const key of words)
      if (body[key] === undefined) errors.push(`${at}: ${kind} needs a ${key}`);
    if (kind === "fill") {
      if (body.enter !== undefined && body.enter !== 1)
        errors.push(`${at}: fill.enter is 1 or absent`);
      if (SECRET_FIELD_RE.test(`${body.label ?? ""} ${body.tid ?? ""}`))
        errors.push(
          `${at}: a fill into a password / secret / token / key field would publish its value in the PR comment`,
        );
    }
  });
}

/**
 * A stop reads in the language it was written in (`lng`) plus whatever `i18n`
 * translates it into. Both or neither: a translation with no base language to
 * switch back from would give the reader a toggle with one side blank.
 */
function checkI18n(stop, where, errors) {
  const { lng, i18n } = stop;
  if (lng === undefined && i18n === undefined) return;
  if (lng !== undefined && (typeof lng !== "string" || !LANG_RE.test(lng)))
    errors.push(`${where}: lng must be a language code like "ko"`);
  else if (lng !== undefined && lng !== STOP_LNG)
    errors.push(
      `${where}: lng must be "${STOP_LNG}" — the PR comment prints it`,
    );
  if (i18n === undefined)
    return errors.push(`${where}: lng needs i18n — one language is no toggle`);
  if (lng === undefined)
    return errors.push(`${where}: i18n needs lng, the language ch/ck are in`);
  if (!i18n || typeof i18n !== "object" || Array.isArray(i18n))
    return errors.push(`${where}: i18n must be an object keyed by language`);
  const langs = Object.keys(i18n);
  if (!langs.length)
    return errors.push(`${where}: i18n names no language — drop it or fill it`);
  if (langs.length > I18N_LANGS_MAX)
    errors.push(`${where}: i18n holds at most ${I18N_LANGS_MAX} languages`);
  for (const lang of langs) {
    const at = `${where}.i18n.${lang}`;
    if (!LANG_RE.test(lang))
      errors.push(`${at}: not a language code like "en"`);
    if (lang === lng)
      errors.push(`${at}: is already the language ch/ck are written in`);
    else if (LANG_RE.test(lang) && !STOP_TRANSLATIONS.includes(lang))
      errors.push(`${at}: only ${STOP_TRANSLATIONS.join(", ")} is written`);
    const text = i18n[lang];
    if (!text || typeof text !== "object" || Array.isArray(text)) {
      errors.push(`${at}: not an object`);
      continue;
    }
    if (!isText(text.ch, STOP_TEXT_MAX))
      errors.push(`${at}: ch is required (<= ${STOP_TEXT_MAX} chars)`);
    if (!isText(text.ck, STOP_TEXT_MAX))
      errors.push(`${at}: ck is required (<= ${STOP_TEXT_MAX} chars)`);
    for (const key of ["old", "new"]) {
      if (text[key] !== undefined && !isText(text[key], STOP_LITERAL_MAX))
        errors.push(`${at}: ${key} must be 1-${STOP_LITERAL_MAX} chars`);
    }
    if (text.via !== undefined) checkVia(text.via, at, errors);
  }
}

function checkStop(stop, index, errors) {
  const where = `stop ${index + 1}`;
  if (!stop || typeof stop !== "object")
    return errors.push(`${where}: not an object`);
  if (typeof stop.route !== "string" || !/^\/(?![/\\])/.test(stop.route))
    errors.push(`${where}: route must be an origin-relative path like "/data"`);
  if (
    stop.scope !== undefined &&
    stop.scope !== "project" &&
    stop.scope !== "app"
  )
    errors.push(`${where}: scope must be "project" (default) or "app"`);
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
  checkI18n(stop, where, errors);
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

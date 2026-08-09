/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Rule engine for the self-hosted form engine (to-astryx ticket 34).

 A behavioural port of the slice of rc-component's `async-validator` that
 rc-component's `form` reaches for the NINE rule keys this repository actually
 uses (`required`, `message`, `validator`, `type`, `max`, `min`, `pattern`,
 `warningOnly`, `whitespace`) and the FIVE `type` values it actually passes
 (`number`, `string`, `email`, `url`, `object`) — measured over 237 `rules`
 declarations in answers/08 §1.4. `enum` / `len` / `transform` / `defaultField`
 / `fields` and the date/regexp/hex/float/integer/method/array/boolean types
 have zero call sites and are deliberately absent.

 Two upstream quirks are reproduced ON PURPOSE because call sites depend on
 the observable result:

 1. METHOD DISPATCH BY KEY SHAPE. async-validator picks its validator from
    `Object.keys(rule)` minus `message`: exactly `['required']` uses the bare
    required check, anything else falls through to `rule.type ?? 'string'`
    (and to `'pattern'` when a RegExp `pattern` is present without a `type`).
    Consequences that look like bugs but are the status quo:
      - `{ max: 64 }` on a non-string value ALSO reports "is not a valid
        string", because the string validator runs `type` before `range`.
      - `{ pattern, max }` silently ignores `max`, because the pattern
        validator only runs the pattern check.
    Diverging here would change which messages users see today.

 2. `message` REPLACES, and `''` IS A MESSAGE. Once a rule produces any
    error, a non-null `rule.message` replaces the generated text wholesale.
    An empty-string message therefore yields one error with no text — an
    error STATE without an error LINE. Nine call sites rely on that
    (answers/08 §1.4); treating `''` as "unset" would make them print
    generated English.
 */
import type {
  RuleObject,
  RuleType,
  StoreValue,
  ValidateMessages,
} from './interface';
import type { InternalNamePath } from './namePath';
import { toArray } from './namePath';
import { isValidElement, cloneElement } from 'react';

/** Sentinel used when a validator throws synchronously. */
const CODE_LOGIC_ERROR = 'CODE_LOGIC_ERROR';

// ============================ Message formatting ============================

const formatRegExp = /%[sdj%]/g;

/**
 * async-validator's `format`. Our templates use `${}` placeholders (resolved
 * later by `replaceMessage`), so in practice this only matters for the
 * function-template form that a locale may supply.
 */
function format(template: any, ...args: any[]): any {
  let i = 0;
  const len = args.length;
  if (typeof template === 'function') {
    return template(...args);
  }
  if (typeof template === 'string') {
    return template.replace(formatRegExp, (x) => {
      if (x === '%%') return '%';
      if (i >= len) return x;
      switch (x) {
        case '%s':
          return String(args[i++]);
        case '%d':
          return String(Number(args[i++]));
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch {
            return '[Circular]';
          }
        default:
          return x;
      }
    });
  }
  return template;
}

/** `I'm ${name}` + `{ name: 'bamboo' }` => `I'm bamboo`. `\${x}` escapes. */
function replaceMessage(template: string, kv: Record<string, any>): string {
  return template.replace(/\\?\$\{\w+\}/g, (str) => {
    if (str.startsWith('\\')) {
      return str.slice(1);
    }
    const key = str.slice(2, -1);
    return kv[key];
  });
}

// ================================ Type checks ===============================

// http://emailregex.com/ — copied verbatim from async-validator so the same
// addresses pass/fail as before the migration.
const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+\.)+[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}))$/;

let urlReg: RegExp | undefined;
/** Lazily built URL regex (kevva/url-regex), same construction as upstream. */
function getUrlRegex(): RegExp {
  if (urlReg) return urlReg;
  const v4 =
    '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}';
  const v6seg = '[a-fA-F\\d]{1,4}';
  const v6List = [
    `(?:${v6seg}:){7}(?:${v6seg}|:)`,
    `(?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)`,
    `(?:${v6seg}:){5}(?::${v4}|(?::${v6seg}){1,2}|:)`,
    `(?:${v6seg}:){4}(?:(?::${v6seg}){0,1}:${v4}|(?::${v6seg}){1,3}|:)`,
    `(?:${v6seg}:){3}(?:(?::${v6seg}){0,2}:${v4}|(?::${v6seg}){1,4}|:)`,
    `(?:${v6seg}:){2}(?:(?::${v6seg}){0,3}:${v4}|(?::${v6seg}){1,5}|:)`,
    `(?:${v6seg}:){1}(?:(?::${v6seg}){0,4}:${v4}|(?::${v6seg}){1,6}|:)`,
    `(?::(?:(?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))`,
  ];
  const v6 = `(?:${v6List.join('|')})(?:%[0-9a-zA-Z]{1,})?`;
  const protocol = '(?:(?:[a-z]+:)?//)';
  const auth = '(?:\\S+(?::\\S*)?@)?';
  const host = '(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)';
  const domain =
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
  const tld = '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))';
  const port = '(?::\\d{2,5})?';
  const path = '(?:[/?#][^\\s"]*)?';
  const regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${v4}|${v6}|${host}${domain}${tld})${port}${path}`;
  urlReg = new RegExp(`(?:^${regex}$)`, 'i');
  return urlReg;
}

const TYPE_CHECKS: Partial<Record<string, (value: any) => boolean>> = {
  number: (value) => !isNaN(value) && typeof value === 'number',
  object: (value) => typeof value === 'object' && !Array.isArray(value),
  email: (value) =>
    typeof value === 'string' &&
    value.length <= 320 &&
    EMAIL_PATTERN.test(value),
  url: (value) =>
    typeof value === 'string' &&
    value.length <= 2048 &&
    getUrlRegex().test(value),
};

/** Types whose "empty" notion includes the empty string. */
function isNativeStringType(type?: string) {
  return (
    type === 'string' ||
    type === 'url' ||
    type === 'email' ||
    type === 'pattern'
  );
}

function isEmptyValue(value: any, type?: string): boolean {
  if (value === undefined || value === null) return true;
  if (type === 'array' && Array.isArray(value) && !value.length) return true;
  if (isNativeStringType(type) && typeof value === 'string' && !value)
    return true;
  return false;
}

// ============================= Declarative rules ============================

/**
 * `type` widens to `string` here because the dispatcher normalises it the way
 * async-validator does: an absent type becomes `'string'` and a bare RegExp
 * `pattern` becomes `'pattern'` — neither of which is a public `RuleType`.
 */
type NormalizedRule = Omit<RuleObject, 'type'> & { type?: string };

interface RuleCtx {
  rule: NormalizedRule;
  value: StoreValue;
  name: string;
  messages: ValidateMessages;
  errors: any[];
}

function checkRequired(
  { rule, value, name, messages, errors }: RuleCtx,
  type?: string,
) {
  if (rule.required && isEmptyValue(value, type || rule.type)) {
    errors.push(format(messages.required, name));
  }
}

function checkType({ rule, value, name, messages, errors }: RuleCtx) {
  if (rule.required && value === undefined) {
    checkRequired({ rule, value, name, messages, errors });
    return;
  }
  const ruleType = rule.type;
  const custom = TYPE_CHECKS[ruleType as string];
  if (custom) {
    if (!custom(value)) {
      errors.push(
        format(messages.types?.[ruleType as RuleType], name, ruleType),
      );
    }
  } else if (ruleType && typeof value !== ruleType) {
    errors.push(format(messages.types?.[ruleType as RuleType], name, ruleType));
  }
}

// Surrogate pairs count as one character, matching upstream's `range`.
const SP_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function checkRange({ rule, value, name, messages, errors }: RuleCtx) {
  const hasMin = typeof rule.min === 'number';
  const hasMax = typeof rule.max === 'number';
  let val: number;
  let key: 'number' | 'string' | 'array';
  if (typeof value === 'number') {
    key = 'number';
    val = value;
  } else if (typeof value === 'string') {
    key = 'string';
    val = value.replace(SP_REGEXP, '_').length;
  } else if (Array.isArray(value)) {
    key = 'array';
    val = value.length;
  } else {
    // Unsupported type for range validation — upstream bails out silently.
    return;
  }
  const section = messages[key] as Record<string, any> | undefined;
  if (hasMin && !hasMax && val < (rule.min as number)) {
    errors.push(format(section?.min, name, rule.min));
  } else if (hasMax && !hasMin && val > (rule.max as number)) {
    errors.push(format(section?.max, name, rule.max));
  } else if (
    hasMin &&
    hasMax &&
    (val < (rule.min as number) || val > (rule.max as number))
  ) {
    errors.push(format(section?.range, name, rule.min, rule.max));
  }
}

function checkPattern({ rule, value, name, messages, errors }: RuleCtx) {
  if (rule.pattern instanceof RegExp) {
    // Reset in case the RegExp carries the `g` flag — a stateful `lastIndex`
    // makes the same rule pass and fail alternately.
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(value)) {
      errors.push(
        format(messages.pattern?.mismatch, name, value, rule.pattern),
      );
    }
  }
}

function checkWhitespace({ value, name, messages, errors }: RuleCtx) {
  if (/^\s+$/.test(value) || value === '') {
    errors.push(format(messages.whitespace, name));
  }
}

/**
 * Run the declarative validator async-validator would have selected.
 * `ctx.rule.type` is already normalised by the caller.
 */
function runDeclarative(method: string, ctx: RuleCtx) {
  const { rule, value } = ctx;
  switch (method) {
    case 'required': {
      checkRequired(ctx, Array.isArray(value) ? 'array' : typeof value);
      return;
    }
    case 'number': {
      const numeric = { ...ctx, value: value === '' ? undefined : value };
      if (isEmptyValue(numeric.value) && !rule.required) return;
      checkRequired(numeric);
      if (numeric.value !== undefined) {
        checkType(numeric);
        checkRange(numeric);
      }
      return;
    }
    case 'object': {
      if (isEmptyValue(value) && !rule.required) return;
      checkRequired(ctx);
      if (value !== undefined) {
        checkType(ctx);
      }
      return;
    }
    case 'email':
    case 'url': {
      if (isEmptyValue(value, method) && !rule.required) return;
      checkRequired(ctx, method);
      if (!isEmptyValue(value, method)) {
        checkType(ctx);
      }
      return;
    }
    case 'pattern': {
      if (isEmptyValue(value, 'string') && !rule.required) return;
      checkRequired(ctx);
      if (!isEmptyValue(value, 'string')) {
        checkPattern(ctx);
      }
      return;
    }
    // 'string' and anything else fall back to the string validator, which is
    // also async-validator's default when no `type` is declared.
    default: {
      if (isEmptyValue(value, 'string') && !rule.required) return;
      checkRequired(ctx, 'string');
      if (!isEmptyValue(value, 'string')) {
        checkType(ctx);
        checkRange(ctx);
        checkPattern(ctx);
        if (rule.whitespace === true) {
          checkWhitespace(ctx);
        }
      }
    }
  }
}

// ============================= Custom validators ============================

/**
 * Collapse the promise/callback bridge rc-component's `form` builds around a
 * user `validator` into a single promise for the raw "callback argument".
 *
 * Net semantics preserved from the two-layer upstream wrapping:
 *   resolve()                -> no error
 *   reject('msg') / Error    -> that message
 *   reject()                 -> one error whose text is a single space, i.e.
 *                               an error STATE with no readable line
 *                               (SessionLauncherPage.tsx uses this)
 *   callback('msg')          -> that message, one microtask later
 *   synchronous throw        -> the generic `default` message
 * A validator that both returns a promise and calls `callback` has its
 * callback ignored, exactly as upstream warns.
 */
function runCustomValidator(rule: RuleObject, value: StoreValue): Promise<any> {
  return new Promise((resolve) => {
    let settled = false;
    let hasPromise = false;
    const finish = (arg: any) => {
      if (settled) return;
      settled = true;
      resolve(arg);
    };
    const userCallback = (...args: any[]) => {
      Promise.resolve().then(() => {
        if (!hasPromise) {
          finish(args.length ? args[0] : undefined);
        }
      });
    };
    let returned: any;
    try {
      returned = rule.validator!(rule, value, userCallback);
    } catch (error) {
      // Upstream logs and converts a thrown validator into the generic
      // `default` message; swallowing it silently would hide real bugs.
      // eslint-disable-next-line no-console
      console.error(error);
      finish(CODE_LOGIC_ERROR);
      return;
    }
    hasPromise =
      !!returned &&
      typeof returned.then === 'function' &&
      typeof returned.catch === 'function';
    if (hasPromise) {
      returned.then(
        () => finish(undefined),
        (err: any) => finish(err || ' '),
      );
    }
  });
}

// ================================ Rule driver ===============================

/** Which async-validator method would handle this rule? */
function pickMethod(rule: RuleObject): string {
  const keys = Object.keys(rule).filter((key) => key !== 'message');
  if (keys.length === 1 && keys[0] === 'required') {
    return 'required';
  }
  if (rule.type === undefined && rule.pattern instanceof RegExp) {
    return 'pattern';
  }
  return rule.type ?? 'string';
}

async function validateRule(
  name: string,
  value: StoreValue,
  rule: RuleObject,
  messages: ValidateMessages,
  messageVariables?: Record<string, string>,
): Promise<any[]> {
  let rawErrors: any[] = [];

  if (rule.validator) {
    const cbArg = await runCustomValidator(rule, value);
    rawErrors =
      cbArg === undefined ? [] : Array.isArray(cbArg) ? cbArg : [cbArg];
  } else {
    const method = pickMethod(rule);
    // `getType` normalises the rule's own `type` before the validators read
    // it — `undefined` becomes `'string'`, a bare RegExp becomes `'pattern'`.
    const effectiveRule: NormalizedRule = {
      ...rule,
      type: method === 'required' ? rule.type : method,
    };
    const ctx: RuleCtx = {
      rule: effectiveRule,
      value,
      name,
      messages,
      errors: [],
    };
    runDeclarative(method, ctx);
    rawErrors = ctx.errors;
  }

  // A declared `message` replaces the generated text — including `''`.
  if (rawErrors.length && rule.message !== undefined && rule.message !== null) {
    rawErrors = ([] as any[]).concat(rule.message);
  }

  const result = rawErrors.map((entry, index) => {
    // Mirrors async-validator's `isErrorObj` + `complementError`: anything
    // carrying a defined `.message` (an `Error`, a rejected object) is read
    // through it; a thunk is invoked; everything else is the message itself.
    const message =
      entry && entry.message !== undefined
        ? entry.message
        : typeof entry === 'function'
          ? entry()
          : entry;
    const merged = message === CODE_LOGIC_ERROR ? messages.default : message;
    return isValidElement(merged)
      ? cloneElement(merged as any, { key: `error_${index}` })
      : merged;
  });

  const kv: Record<string, any> = {
    ...rule,
    name,
    ...messageVariables,
  };
  return result.map((error) =>
    typeof error === 'string' ? replaceMessage(error, kv) : error,
  );
}

/**
 * Validate one field's value against its rules.
 *
 * ALWAYS REJECTS in the default (parallel) mode — with a `RuleError[]` that
 * may well be empty. This is upstream's contract and both `Field` and
 * `FormStore` are written against it: the caller partitions the array into
 * errors and warnings by each rule's `warningOnly`, and an empty array means
 * "valid". `validateFirst === true` instead resolves `[]` on success.
 */
export function validateRules(
  namePath: InternalNamePath,
  value: StoreValue,
  rules: RuleObject[],
  messages: ValidateMessages,
  validateFirst?: boolean | 'parallel',
  messageVariables?: Record<string, string>,
): Promise<{ errors: any[]; rule: RuleObject }[]> {
  const name = namePath.join('.');

  // Non-warning rules first; ties keep declaration order. This is what makes
  // a hard error win over a `warningOnly` rule on the same field.
  const filledRules = rules
    .map((rule, ruleIndex) => ({ rule, ruleIndex }))
    .sort((a, b) => {
      if (!!a.rule.warningOnly === !!b.rule.warningOnly) {
        return a.ruleIndex - b.ruleIndex;
      }
      return a.rule.warningOnly ? 1 : -1;
    })
    .map(({ rule }) => rule);

  let summaryPromise: Promise<{ errors: any[]; rule: RuleObject }[]>;

  if (validateFirst === true) {
    summaryPromise = new Promise((resolve, reject) => {
      (async () => {
        for (let i = 0; i < filledRules.length; i += 1) {
          const rule = filledRules[i];
          // Serial ON PURPOSE: `validateFirst` means "stop at the first
          // failing rule", so the rules must not run in parallel.
          const errors = await validateRule(
            name,
            value,
            rule,
            messages,
            messageVariables,
          );
          if (errors.length) {
            reject([{ errors, rule }]);
            return;
          }
        }
        resolve([]);
      })();
    });
  } else {
    const rulePromises = filledRules.map((rule) =>
      validateRule(name, value, rule, messages, messageVariables).then(
        (errors) => ({ errors, rule }),
      ),
    );
    summaryPromise = (
      validateFirst
        ? finishOnFirstFailed(rulePromises)
        : Promise.all(rulePromises)
    ).then((errors) => Promise.reject(errors));
  }

  // Keep the rejection from surfacing as an unhandled rejection; every real
  // consumer attaches its own handler.
  summaryPromise.catch((e) => e);
  return summaryPromise;
}

function finishOnFirstFailed(
  rulePromises: Promise<{ errors: any[]; rule: RuleObject }>[],
): Promise<{ errors: any[]; rule: RuleObject }[]> {
  let count = 0;
  return new Promise((resolve) => {
    rulePromises.forEach((promise) => {
      promise.then((ruleError) => {
        if (ruleError.errors.length) {
          resolve([ruleError]);
        }
        count += 1;
        if (count === rulePromises.length) {
          resolve([]);
        }
      });
    });
  });
}

export { toArray };

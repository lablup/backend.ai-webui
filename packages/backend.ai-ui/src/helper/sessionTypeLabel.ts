import type { TFunction } from 'i18next';

const SESSION_TYPE_LABEL_KEYS: Record<string, string> = {
  INTERACTIVE: 'comp:BAISessionTypeToken.Interactive',
  BATCH: 'comp:BAISessionTypeToken.Batch',
  INFERENCE: 'comp:BAISessionTypeToken.Inference',
  SYSTEM: 'comp:BAISessionTypeToken.System',
};

/**
 * Pass `t` from `useBAIi18n()`: the keys live in BUI's own i18next instance.
 * Takes the upper-cased type; unknown types fall back to the raw value.
 */
export const getSessionTypeLabel = (
  t: TFunction,
  upperType: string,
): string => {
  const key = SESSION_TYPE_LABEL_KEYS[upperType];
  return key ? t(key) : upperType;
};

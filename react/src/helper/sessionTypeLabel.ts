import type { TFunction } from 'i18next';

const SESSION_TYPE_LABEL_KEYS: Record<string, string> = {
  interactive: 'session.Interactive',
  batch: 'session.Batch',
  inference: 'session.Inference',
  system: 'session.System',
};

/** Unknown types fall back to the raw value rather than an empty label. */
export const getSessionTypeLabel = (
  t: TFunction,
  type: string | null | undefined,
): string => {
  const key = SESSION_TYPE_LABEL_KEYS[(type ?? '').toLowerCase()];
  return key ? t(key) : (type ?? '');
};

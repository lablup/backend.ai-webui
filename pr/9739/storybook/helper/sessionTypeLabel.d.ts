import { TFunction } from 'i18next';
/**
 * Pass `t` from `useBAIi18n()`: the keys live in BUI's own i18next instance.
 * Takes the upper-cased type; unknown types fall back to the raw value.
 */
export declare const getSessionTypeLabel: (t: TFunction, upperType: string) => string;

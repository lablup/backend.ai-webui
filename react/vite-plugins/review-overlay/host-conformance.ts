/**
 * The second host, stated in types only (ADR 0008). Nothing imports this file
 * and it ships nowhere: it exists so `tsconfig.host.json` — the gate that
 * compiles `client/` under the Chrome extension's compiler flags — fails when
 * the seam stops being usable the way phase B uses it.
 */
import {
  defaultOverlayHost,
  type OverlayHandle,
  type OverlayHostOptions,
} from './client/boot.js';

/** Every option a host may answer, as the extension answers them. */
export const extensionHost: OverlayHostOptions = {
  state: { embedded: () => null, fetch: () => Promise.resolve(null) },
  bootHash: '',
  pageChords: false,
  autoNavigate: false,
  palette: 'own',
  marker: 'extension',
  expectReactGrab: false,
};

/**
 * A RESOLVED host is itself valid options. Under `exactOptionalPropertyTypes`
 * that only holds while every `OverlayHost` field admits `undefined` wherever
 * its option counterpart is optional — which is what this line is here for.
 */
export const derivedHost = (): OverlayHostOptions => ({
  ...defaultOverlayHost(),
  pageChords: false,
});

/** The whole programmatic surface a host drives the overlay through. */
export type SecondHostSurface = Pick<
  OverlayHandle,
  'startPick' | 'cancelPick' | 'toggleCards' | 'pinCount'
>;

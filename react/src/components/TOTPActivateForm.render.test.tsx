/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Render test for `TOTPActivateForm` — specifically the QR code.
 *
 * Why a unit test rather than a live check (p3-w3b): the TOTP setup flow is
 * only reachable when the connected cluster reports TOTP support, and the dev
 * backend does not, so the modal cannot be opened by hand. The QR is also the
 * one piece of this screen with no textual fallback — if it silently stops
 * rendering, nothing else on the page changes — so it is worth pinning.
 *
 * What this asserts is the contract the swap from antd `QRCode` to
 * `qrcode.react` has to preserve:
 *
 *  - an SVG is produced, sized to antd's old 160px default so the modal's
 *    layout is unchanged;
 *  - it encodes the `totp_uri` we passed (module count scales with payload
 *    length, so a fixed viewBox would mean the value was ignored);
 *  - it is literally black-on-white in every theme. That is a scanner
 *    requirement, not a style: antd's `QRCode` defaulted to a TRANSPARENT
 *    background, which over the dark-mode dialog surface is black modules on
 *    near-black and unreadable by a phone camera.
 */
import { TOTPActivateForm } from './TOTPActivateModal';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

// Partial mock: `backend.ai-ui` initialises its own i18next instance with
// `initReactI18next` at import time, so the rest of the module must survive.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const TOTP_URI =
  'otpauth://totp/Backend.AI:admin@lablup.com?secret=JBSWY3DPEHPK3PXP&issuer=Backend.AI';

const renderForm = (totpUri = TOTP_URI) =>
  render(
    <TOTPActivateForm
      ref={createRef()}
      totp_uri={totpUri}
      totp_key="JBSWY3DPEHPK3PXP"
    />,
  );

/** The QR is the only SVG here whose viewBox is a square module grid. */
const findQr = (container: HTMLElement) =>
  [...container.querySelectorAll('svg')].find((svg) => {
    const box = (svg.getAttribute('viewBox') ?? '').split(' ');
    return box.length === 4 && box[0] === '0' && box[1] === '0';
  });

describe('TOTPActivateForm QR code', () => {
  it('renders an SVG QR at antd QRCode’s old 160px default size', () => {
    const { container } = renderForm();
    const qr = findQr(container);

    expect(qr).toBeTruthy();
    expect(qr?.getAttribute('height')).toBe('160');
    expect(qr?.getAttribute('width')).toBe('160');
  });

  it('encodes the totp_uri it was given', () => {
    // A longer payload needs more modules, so the grid must grow with it. If
    // the value were ignored, both renders would share a viewBox.
    const short = findQr(renderForm('otpauth://totp/a?secret=AA').container);
    const long = findQr(
      renderForm(`${TOTP_URI}&digits=6&period=30&algorithm=SHA1`).container,
    );

    expect(short?.getAttribute('viewBox')).toBeTruthy();
    expect(long?.getAttribute('viewBox')).not.toBe(
      short?.getAttribute('viewBox'),
    );
  });

  it('pins scanner contrast to black-on-white instead of theming it', () => {
    const { container } = renderForm();
    const qr = findQr(container);
    const paths = [...(qr?.querySelectorAll('path') ?? [])];

    // qrcode.react emits the quiet-zone background first, then the modules.
    expect(paths.length).toBeGreaterThanOrEqual(2);
    expect(paths[0]?.getAttribute('fill')).toBe('#ffffff');
    expect(paths[1]?.getAttribute('fill')).toBe('#000000');
  });

  it('renders no antd QRCode markup', () => {
    const { container } = renderForm();
    expect(container.querySelector('.ant-qrcode')).toBeNull();
  });
});

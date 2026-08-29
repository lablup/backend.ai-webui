/**
 * FR-3764: with `VITE_WEBMCP` unset the dev WebMCP plugin injects nothing,
 * registers no middleware and leaves the dev CSP untouched.
 */
import { afterEach, describe, expect, it } from 'vitest';
import type { IndexHtmlTransformResult } from 'vite';
import { devWebMCPPlugin, withWebMCPCspHeaders } from './webmcp';

const DEV_CSP = {
  'Content-Security-Policy': [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
    `frame-src 'self' http: https:`,
    `object-src 'none'`,
  ].join('; '),
};

const transform = (): IndexHtmlTransformResult | undefined => {
  const plugin = devWebMCPPlugin();
  const hook = plugin.transformIndexHtml;
  if (!hook || typeof hook === 'function' || !hook.handler) return undefined;
  // The plugin's handler ignores every argument but the html string.
  return (hook.handler as (html: string) => IndexHtmlTransformResult)('<html>');
};

afterEach(() => {
  delete process.env.VITE_WEBMCP;
});

describe('devWebMCPPlugin, flag off', () => {
  it('is inert: no html transform and no middleware', () => {
    const plugin = devWebMCPPlugin();

    expect(plugin.apply).toBe('serve');
    expect(plugin.transformIndexHtml).toBeUndefined();
    expect(plugin.configureServer).toBeUndefined();
    expect(transform()).toBeUndefined();
  });

  it('leaves the dev CSP unchanged', () => {
    expect(withWebMCPCspHeaders(DEV_CSP)).toEqual(DEV_CSP);
  });

  it('stays off for any value other than "on"', () => {
    process.env.VITE_WEBMCP = '1';
    expect(devWebMCPPlugin().transformIndexHtml).toBeUndefined();
    expect(withWebMCPCspHeaders(DEV_CSP)).toEqual(DEV_CSP);
  });
});

describe('devWebMCPPlugin, VITE_WEBMCP=on', () => {
  it('injects the polyfill and the relay embed into <head>', () => {
    process.env.VITE_WEBMCP = 'on';

    const result = transform();

    expect(result).toMatchObject({
      tags: [
        {
          tag: 'script',
          attrs: { src: '/__webmcp/global.iife.js' },
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { src: '/__webmcp/embed.js' },
          injectTo: 'head',
        },
      ],
    });
  });

  it('adds frame-src blob: for the relay widget iframe, and nothing else', () => {
    process.env.VITE_WEBMCP = 'on';

    const patched = withWebMCPCspHeaders(DEV_CSP)['Content-Security-Policy'];

    expect(patched).toContain(`frame-src 'self' http: https: blob:`);
    expect(patched.replace(' blob:', '')).toBe(
      DEV_CSP['Content-Security-Policy'],
    );
  });

  it('leaves a report-only policy alone', () => {
    process.env.VITE_WEBMCP = 'on';
    const reportOnly = {
      'Content-Security-Policy-Report-Only': `frame-src 'self'`,
    };

    expect(withWebMCPCspHeaders(reportOnly)).toEqual(reportOnly);
  });
});

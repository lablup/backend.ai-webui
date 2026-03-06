/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  checkCspConnectSrc,
  checkCspScriptSrc,
  checkCspStyleSrc,
  checkCspWsConnectSrc,
  parseCspConnectSrc,
  parseCspDirective,
} from '../cspRules';
import { describe, expect, it } from '@jest/globals';

describe('parseCspConnectSrc', () => {
  it('should return empty array for null/undefined input', () => {
    expect(parseCspConnectSrc(null)).toEqual([]);
    expect(parseCspConnectSrc(undefined)).toEqual([]);
  });

  it('should return empty array when no connect-src directive exists', () => {
    expect(parseCspConnectSrc("default-src 'self'")).toEqual([]);
  });

  it('should parse connect-src with multiple sources', () => {
    const csp =
      "default-src 'self'; connect-src https://api.example.com wss://ws.example.com; script-src 'self'";
    expect(parseCspConnectSrc(csp)).toEqual([
      'https://api.example.com',
      'wss://ws.example.com',
    ]);
  });

  it('should parse connect-src at end of string (no trailing semicolon)', () => {
    const csp = "default-src 'self'; connect-src https://api.example.com";
    expect(parseCspConnectSrc(csp)).toEqual(['https://api.example.com']);
  });
});

describe('checkCspConnectSrc', () => {
  it('should return null when CSP content is empty', () => {
    expect(checkCspConnectSrc(null, 'https://api.example.com')).toBeNull();
    expect(checkCspConnectSrc('', 'https://api.example.com')).toBeNull();
  });

  it('should return null when endpoint is empty', () => {
    expect(checkCspConnectSrc("connect-src 'self'", '')).toBeNull();
  });

  it('should return null when neither connect-src nor default-src exists', () => {
    expect(
      checkCspConnectSrc("script-src 'self'", 'https://api.example.com'),
    ).toBeNull();
  });

  it('should return null when wildcard * is present', () => {
    expect(
      checkCspConnectSrc('connect-src *', 'https://api.example.com'),
    ).toBeNull();
  });

  it('should return null when endpoint matches a CSP source', () => {
    expect(
      checkCspConnectSrc(
        'connect-src https://api.example.com',
        'https://api.example.com',
      ),
    ).toBeNull();
  });

  it('should return diagnostic when endpoint is not in CSP sources', () => {
    const result = checkCspConnectSrc(
      'connect-src https://other.example.com',
      'https://api.example.com',
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe('csp-connect-src-api');
    expect(result?.severity).toBe('critical');
    expect(result?.interpolationValues?.endpoint).toBe(
      'https://api.example.com',
    );
  });

  it('should match wildcard domain sources', () => {
    expect(
      checkCspConnectSrc(
        'connect-src *.example.com',
        'https://api.example.com',
      ),
    ).toBeNull();
  });

  it('should not match apex domain for wildcard (*.example.com vs example.com)', () => {
    const result = checkCspConnectSrc(
      'connect-src *.example.com',
      'https://example.com',
    );
    expect(result).not.toBeNull();
  });

  it('should not match unrelated domain for wildcard (*.example.com vs badexample.com)', () => {
    const result = checkCspConnectSrc(
      'connect-src *.example.com',
      'https://badexample.com',
    );
    expect(result).not.toBeNull();
  });

  it("should match 'self' only when page origin matches endpoint", () => {
    // Same origin — should pass
    expect(
      checkCspConnectSrc(
        "connect-src 'self'",
        'https://app.example.com/api',
        'https://app.example.com',
      ),
    ).toBeNull();

    // Different origin — should fail
    const result = checkCspConnectSrc(
      "connect-src 'self'",
      'https://api.other.com',
      'https://app.example.com',
    );
    expect(result).not.toBeNull();
  });

  it("should treat 'self' as non-matching when no pageOrigin provided", () => {
    const result = checkCspConnectSrc(
      "connect-src 'self'",
      'https://api.example.com',
    );
    expect(result).not.toBeNull();
  });

  // default-src fallback tests
  it('should fall back to default-src when connect-src is absent', () => {
    // default-src allows the endpoint
    expect(
      checkCspConnectSrc(
        'default-src https://api.example.com',
        'https://api.example.com',
      ),
    ).toBeNull();

    // default-src blocks the endpoint
    const result = checkCspConnectSrc(
      'default-src https://other.example.com',
      'https://api.example.com',
    );
    expect(result).not.toBeNull();
  });
});

describe('checkCspWsConnectSrc', () => {
  it('should return null when CSP content or proxy URL is empty', () => {
    expect(checkCspWsConnectSrc(null, 'wss://ws.example.com')).toBeNull();
    expect(checkCspWsConnectSrc("connect-src 'self'", '')).toBeNull();
  });

  it('should return null when proxy URL matches CSP source', () => {
    expect(
      checkCspWsConnectSrc(
        'connect-src wss://ws.example.com',
        'wss://ws.example.com',
      ),
    ).toBeNull();
  });

  it('should return diagnostic when proxy URL is not in CSP sources', () => {
    const result = checkCspWsConnectSrc(
      'connect-src https://api.example.com',
      'wss://ws.other.com',
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe('csp-connect-src-ws');
    expect(result?.severity).toBe('critical');
  });

  it('should return null for invalid proxy URL', () => {
    expect(
      checkCspWsConnectSrc('connect-src https://api.example.com', 'not-a-url'),
    ).toBeNull();
  });

  it('should compare protocol when matching WS sources', () => {
    // https source should NOT match wss proxy (different protocols)
    const result = checkCspWsConnectSrc(
      'connect-src https://ws.example.com',
      'wss://ws.example.com',
    );
    expect(result).not.toBeNull();
  });

  it('should handle scheme-only sources like wss:', () => {
    expect(
      checkCspWsConnectSrc('connect-src wss:', 'wss://ws.example.com'),
    ).toBeNull();
  });

  it('should fall back to default-src when connect-src is absent', () => {
    expect(
      checkCspWsConnectSrc(
        'default-src wss://ws.example.com',
        'wss://ws.example.com',
      ),
    ).toBeNull();

    const result = checkCspWsConnectSrc(
      'default-src https://other.example.com',
      'wss://ws.example.com',
    );
    expect(result).not.toBeNull();
  });
});

describe('parseCspDirective', () => {
  it('should parse any CSP directive by name', () => {
    const csp =
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'";
    expect(parseCspDirective(csp, 'script-src')).toEqual([
      "'self'",
      "'unsafe-inline'",
    ]);
    expect(parseCspDirective(csp, 'style-src')).toEqual(["'self'"]);
    expect(parseCspDirective(csp, 'img-src')).toEqual([]);
  });

  it('should return empty array for null/undefined', () => {
    expect(parseCspDirective(null, 'script-src')).toEqual([]);
    expect(parseCspDirective(undefined, 'script-src')).toEqual([]);
  });
});

describe('checkCspScriptSrc', () => {
  it('should return null when no CSP content', () => {
    expect(checkCspScriptSrc(null)).toBeNull();
  });

  it('should return null when neither script-src nor default-src exists', () => {
    expect(checkCspScriptSrc("style-src 'self'")).toBeNull();
  });

  it("should return null when 'self' is allowed", () => {
    expect(checkCspScriptSrc("script-src 'self'")).toBeNull();
  });

  it('should return null when wildcard is present', () => {
    expect(checkCspScriptSrc('script-src *')).toBeNull();
  });

  it("should return diagnostic when 'self' is missing", () => {
    const result = checkCspScriptSrc('script-src https://cdn.example.com');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('csp-script-src-blocked');
    expect(result?.severity).toBe('critical');
  });

  it('should accept nonce-based policies as allowing scripts', () => {
    expect(checkCspScriptSrc("script-src 'nonce-abc123'")).toBeNull();
  });

  it('should accept hash-based policies as allowing scripts', () => {
    expect(checkCspScriptSrc("script-src 'sha256-abc123'")).toBeNull();
    expect(checkCspScriptSrc("script-src 'sha384-abc123'")).toBeNull();
    expect(checkCspScriptSrc("script-src 'sha512-abc123'")).toBeNull();
  });

  it('should fall back to default-src when script-src is absent', () => {
    expect(checkCspScriptSrc("default-src 'self'")).toBeNull();

    const result = checkCspScriptSrc('default-src https://cdn.example.com');
    expect(result).not.toBeNull();
  });
});

describe('checkCspStyleSrc', () => {
  it('should return null when no CSP content', () => {
    expect(checkCspStyleSrc(null)).toBeNull();
  });

  it('should return null when neither style-src nor default-src exists', () => {
    expect(checkCspStyleSrc("script-src 'self'")).toBeNull();
  });

  it("should return null when 'unsafe-inline' is allowed", () => {
    expect(checkCspStyleSrc("style-src 'self' 'unsafe-inline'")).toBeNull();
  });

  it('should return null when wildcard is present', () => {
    expect(checkCspStyleSrc('style-src *')).toBeNull();
  });

  it("should return diagnostic when 'unsafe-inline' is missing", () => {
    const result = checkCspStyleSrc("style-src 'self'");
    expect(result).not.toBeNull();
    expect(result?.id).toBe('csp-style-src-no-inline');
    expect(result?.severity).toBe('warning');
  });

  it('should accept nonce-based policies as allowing inline styles', () => {
    expect(checkCspStyleSrc("style-src 'nonce-abc123'")).toBeNull();
  });

  it('should accept hash-based policies as allowing inline styles', () => {
    expect(checkCspStyleSrc("style-src 'sha256-abc123'")).toBeNull();
  });

  it('should fall back to default-src when style-src is absent', () => {
    // default-src with unsafe-inline — should pass
    expect(checkCspStyleSrc("default-src 'self' 'unsafe-inline'")).toBeNull();

    // default-src without unsafe-inline or nonce — should warn
    const result = checkCspStyleSrc("default-src 'self'");
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
  });
});

/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  hasRenderableSessionStatusData,
  parseSessionStatusData,
} from './sessionStatusData';

describe('parseSessionStatusData', () => {
  it.each([undefined, null, '', '   ', 'null', '{}', ' {} '])(
    'returns null for the empty sentinel %p',
    (raw) => {
      expect(parseSessionStatusData(raw)).toBeNull();
    },
  );

  it('returns null for an unparsable payload', () => {
    expect(parseSessionStatusData('{"error":')).toBeNull();
  });

  it('returns null for a non-object payload', () => {
    expect(parseSessionStatusData('[]')).toBeNull();
    expect(parseSessionStatusData('"failed"')).toBeNull();
    expect(parseSessionStatusData('0')).toBeNull();
  });

  it('returns the parsed object for a populated payload', () => {
    expect(parseSessionStatusData('{"kernel":{"exit_code":1}}')).toEqual({
      kernel: { exit_code: 1 },
    });
  });
});

describe('hasRenderableSessionStatusData', () => {
  it.each([undefined, null, '', 'null', '{}', '{"error":'])(
    'is false for the unrenderable payload %p',
    (raw) => {
      expect(hasRenderableSessionStatusData(raw)).toBe(false);
    },
  );

  // FR-1137: the reporter's terminated session, where the info icon opened a
  // modal that only showed the session name.
  it('is false for an error section with an empty collection', () => {
    expect(hasRenderableSessionStatusData('{"error":{"collection":[]}}')).toBe(
      false,
    );
  });

  it('is false for empty sections', () => {
    expect(
      hasRenderableSessionStatusData(
        '{"kernel":{},"session":{},"scheduler":{},"error":{}}',
      ),
    ).toBe(false);
  });

  it('is true for a kernel exit code, including 0', () => {
    expect(hasRenderableSessionStatusData('{"kernel":{"exit_code":0}}')).toBe(
      true,
    );
  });

  it('is true for a session status', () => {
    expect(
      hasRenderableSessionStatusData('{"session":{"status":"TERMINATED"}}'),
    ).toBe(true);
  });

  it('is true for scheduler predicates', () => {
    expect(
      hasRenderableSessionStatusData(
        '{"scheduler":{"retries":2,"last_try":"2026-01-01T00:00:00+00:00","failed_predicates":[],"passed_predicates":[]}}',
      ),
    ).toBe(true);
  });

  it('is true for a non-empty error collection', () => {
    expect(
      hasRenderableSessionStatusData(
        '{"error":{"collection":[{"name":"AgentError","repr":"boom","src":"agent"}]}}',
      ),
    ).toBe(true);
  });

  it('is true for a bare error without a collection', () => {
    expect(
      hasRenderableSessionStatusData(
        '{"error":{"name":"AgentError","repr":"boom","src":"agent"}}',
      ),
    ).toBe(true);
  });
});

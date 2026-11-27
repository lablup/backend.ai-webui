import { drillReportFile } from './drill-report.js';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = '/repo/e2e/drill-report';

describe('drillReportFile', () => {
  it('serves a report page and its screenshots', () => {
    expect(drillReportFile(ROOT, '/__drill/folder-invitation/')).toBe(
      join(ROOT, 'folder-invitation/index.html'),
    );
    expect(drillReportFile(ROOT, '/__drill/folder-invitation/a--b.png')).toBe(
      join(ROOT, 'folder-invitation/a--b.png'),
    );
  });

  it('never leaves the report folder', () => {
    expect(drillReportFile(ROOT, '/__drill/../../config.toml')).toBeNull();
    expect(drillReportFile(ROOT, '/__drill/%2e%2e/%2e%2e/x.html')).toBeNull();
    expect(drillReportFile(ROOT, '/__drill/x/../../../etc/a.png')).toBeNull();
  });

  it('serves only report file types', () => {
    expect(drillReportFile(ROOT, '/__drill/x/secret.env')).toBeNull();
    expect(drillReportFile(ROOT, '/elsewhere/index.html')).toBeNull();
  });
});

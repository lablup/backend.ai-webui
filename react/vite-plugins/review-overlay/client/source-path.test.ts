import { relativizeSourcePaths } from './source-path';
import { describe, expect, it } from 'vitest';

const ROOT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/fr-3813';

describe('relativizeSourcePaths', () => {
  it('makes a workspace-package frame repository-relative', () => {
    expect(
      relativizeSourcePaths(
        `  in BAIFlex (at ${ROOT}/packages/backend.ai-ui/src/components/BAIFlex.tsx)`,
        ROOT,
      ),
    ).toBe(
      '  in BAIFlex (at packages/backend.ai-ui/src/components/BAIFlex.tsx)',
    );
  });

  it('leaves an app frame exactly as react-grab gave it', () => {
    const line =
      '  in WebUIHeader (at /src/components/MainLayout/WebUIHeader.tsx)';
    expect(relativizeSourcePaths(line, ROOT)).toBe(line);
  });

  it('leaves a path outside the root alone', () => {
    const line = `  in Foo (at /home/ubuntu/elsewhere/Foo.tsx)`;
    expect(relativizeSourcePaths(line, ROOT)).toBe(line);
  });

  it('keeps line and column on a component source', () => {
    expect(
      relativizeSourcePaths(
        `${ROOT}/packages/backend.ai-ui/src/components/BAIFlex.tsx:79:26`,
        ROOT,
      ),
    ).toBe('packages/backend.ai-ui/src/components/BAIFlex.tsx:79:26');
  });

  it('tolerates a trailing slash on the root', () => {
    expect(relativizeSourcePaths(`${ROOT}/react/src/a.tsx`, `${ROOT}/`)).toBe(
      'react/src/a.tsx',
    );
  });

  it('passes the text through when the server named no root', () => {
    const line = `  in BAIFlex (at ${ROOT}/packages/backend.ai-ui/src/x.tsx)`;
    expect(relativizeSourcePaths(line, null)).toBe(line);
    expect(relativizeSourcePaths(line, undefined)).toBe(line);
    expect(relativizeSourcePaths(line, '')).toBe(line);
  });

  it('does not treat the root as a regex', () => {
    const root = '/home/a+b/(x)';
    expect(relativizeSourcePaths(`${root}/src/a.tsx`, root)).toBe('src/a.tsx');
  });
});

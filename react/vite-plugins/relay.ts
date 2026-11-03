import { transformSync } from 'oxc-transform-relay';
import type { Plugin } from 'vite';

export interface RelaySourceTree {
  srcDir: string;
  artifactDirectory: string;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function relay(sourceTrees: RelaySourceTree[]): Plugin {
  const trees = sourceTrees.map(({ srcDir, artifactDirectory }) => ({
    prefix: srcDir.endsWith('/') ? srcDir : `${srcDir}/`,
    artifactDirectory,
  }));
  return {
    name: 'bai:relay',
    enforce: 'pre',
    transform: {
      filter: {
        id: {
          include: trees.map(
            ({ prefix }) =>
              new RegExp(`^${escapeRegExp(prefix)}[^?]*\\.[jt]sx?(?:\\?|$)`),
          ),
          exclude: /\/node_modules\//,
        },
        code: /\bgraphql\s*`/,
      },
      handler(code, id) {
        const [filename] = id.split('?');
        const tree = trees.find(({ prefix }) => filename.startsWith(prefix));
        if (!tree) return;
        const result = transformSync(filename, code, {
          artifactDirectory: tree.artifactDirectory,
          language: 'typescript',
          sourcemap: true,
        });
        if (result.errors.length > 0) {
          this.error(
            result.errors
              .map(({ message, codeframe }) =>
                codeframe ? `${message}\n${codeframe}` : message,
              )
              .join('\n\n'),
          );
        }
        return { code: result.code, map: result.map };
      },
    },
  };
}

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Plugin } from 'vite';

export interface ChunkReportEntry {
  file: string;
  isEntry: boolean;
  isDynamicEntry: boolean;
  size: number;
  facadeModuleId: string | null;
  imports: string[];
  dynamicImports: string[];
  /** [moduleId, renderedLength] for every module rolled into the chunk. */
  modules: Array<[string, number]>;
}

/**
 * Writes one JSON record per emitted JS chunk — its size, its static and
 * dynamic imports, and the rendered length of every module inside it — so
 * `scripts/bundle-report.mjs` can attribute the entry chunk to packages.
 * Enabled with `VITE_CHUNK_REPORT=<path>`.
 */
export function chunkReport(outFile: string): Plugin {
  return {
    name: 'bai:chunk-report',
    apply: 'build',
    generateBundle(_options, bundle) {
      const report: ChunkReportEntry[] = [];
      for (const [file, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue;
        report.push({
          file,
          isEntry: chunk.isEntry,
          isDynamicEntry: chunk.isDynamicEntry,
          size: chunk.code.length,
          facadeModuleId: chunk.facadeModuleId,
          imports: chunk.imports,
          dynamicImports: chunk.dynamicImports,
          modules: Object.entries(chunk.modules).map(([id, m]) => [
            id,
            m.renderedLength,
          ]),
        });
      }
      // Static importers per module, so a report can answer "why is this
      // module in the entry chunk" with the import chain.
      const importers: Record<string, readonly string[]> = {};
      for (const id of this.getModuleIds()) {
        const info = this.getModuleInfo(id);
        if (info && info.importers.length) importers[id] = info.importers;
      }
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, JSON.stringify({ chunks: report, importers }));
    },
  };
}

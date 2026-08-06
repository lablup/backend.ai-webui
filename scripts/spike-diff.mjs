import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const OUT = "/tmp/spike-shots";
for (const view of ["login", "routeerror"]) {
  for (const mode of ["light", "dark"]) {
    const a = `${OUT}/before-${view}-${mode}.png`;
    const b = `${OUT}/after-${view}-${mode}.png`;
    if (!existsSync(a) || !existsSync(b)) {
      console.log(`${view}/${mode}: MISSING`);
      continue;
    }
    const A = PNG.sync.read(readFileSync(a));
    const B = PNG.sync.read(readFileSync(b));
    const diff = new PNG({ width: A.width, height: A.height });
    const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, {
      threshold: 0.1,
    });
    writeFileSync(`${OUT}/diff-${view}-${mode}.png`, PNG.sync.write(diff));
    const pct = ((n / (A.width * A.height)) * 100).toFixed(3);
    console.log(`${view}/${mode}: ${n} px differ (${pct}% of frame)`);
  }
}

/**
 * The Playwright entry point for drills: one test per drill in `catalog.ts`.
 * `E2E_DRILL` selects one; unset runs them all in catalog order.
 */
import { DRILLS } from './catalog';
import { registerDrill } from './drill-test';

const selected = process.env.E2E_DRILL?.trim();
const drills = selected
  ? DRILLS.filter((drill) => drill.id === selected)
  : DRILLS;

if (selected && drills.length === 0) {
  throw new Error(
    `E2E_DRILL="${selected}" is not in e2e/drills/catalog.ts (known: ${DRILLS.map(
      (drill) => drill.id,
    ).join(', ')})`,
  );
}

for (const drill of drills) registerDrill(drill);

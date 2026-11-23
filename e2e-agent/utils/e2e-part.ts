import { resolveE2EParts } from "../../e2e/e2e-parts";

/**
 * The `skip` of a group whose tests change server-global settings: they run
 * only when E2E_PART selects the admin part
 * (.claude/rules/e2e-admin-prep-via-api.md rule 5).
 */
export const skipUnlessAdminPart: false | string = !resolveE2EParts(
  process.env.E2E_PART,
).includes("admin")
  ? "changes server-global settings; runs only with E2E_PART=admin"
  : false;

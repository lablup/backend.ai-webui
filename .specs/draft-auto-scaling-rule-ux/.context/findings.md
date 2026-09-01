# Auto Scaling Rule UX Improvements Findings

## Decisions
| Date | Decision | Rationale | Issue |
|------|----------|-----------|-------|

## Discoveries

- `toLocalId` utility is exported from `packages/backend.ai-ui/src/helper/index.ts` -- used to convert Relay global IDs to raw UUIDs
- `baiClient.supports('auto-scaling-rule')` gates on `>=25.1.0` in `backend.ai-client-esm.ts:842-844`
- `COMPARATOR_LABELS` currently includes all 4 comparators (LT, LTE, GT, GTE) -- spec says only expose LT and GT in Legacy editor
- `EndpointDetailPage` auto-scaling rules table spans lines 765-996 with delete mutation at lines 447-457
- `ServiceLauncherPageContent.tsx` also queries `endpoint_auto_scaling_rule_nodes` to check rule existence -- will need Strawberry path too eventually
- `ModelDeployment.autoScalingRules` is a nested connection on the Strawberry type -- no separate top-level query needed
- `prometheusQueryPresetId` in `UpdateAutoScalingRuleInput` uses `null` as UNSET (no change), not as explicit null

## Issues Encountered
| Date | Problem | Root Cause | Resolution | Issue |
|------|---------|-----------|------------|-------|

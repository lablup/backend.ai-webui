# Endpoint → Deployment UI Migration Tasks

> Last synced: 2026-04-22 (plan creation)
> Source: Jira (project FR)

## Progress: 0/22 complete

### Wave 1 — Foundation (Story 1)

- [ ] FR-2663: Add model-deployment-extended-filter feature flag (26.4.3+) — created
- [ ] FR-2664: Add routes for /deployments + /admin-deployments with legacy fallbacks — created
- [ ] FR-2665: Update sidebar menu: Serving → Deployments — created
- [ ] FR-2666: Add Deployment i18n keys (en.json) + propagate to 21 languages — created

### Wave 2 — Shared components + launcher body + quick-deploy hook

- [ ] FR-2667: Add ReplicaStatusTag component + Storybook story — blocked by FR-2666
- [ ] FR-2668: Add DeploymentStatusTag component — blocked by FR-2666
- [ ] FR-2669: Add DeploymentOwnerInfo component — blocked by FR-2666
- [ ] FR-2674: Add DeploymentLauncherPageContent — multi-step form body — after Wave 1
- [ ] FR-2683: Add useDeploymentLauncher hook (GQL-based Quick Deploy) — blocked by FR-2663

### Wave 3 — List table, launcher page, detail sub-components

- [ ] FR-2670: Add DeploymentList fragment-receiving table — blocked by FR-2667, FR-2668
- [ ] FR-2675: Add DeploymentLauncherPage (create/edit entry) + GQL mutations — blocked by FR-2674, FR-2664
- [ ] FR-2676: Add DeploymentConfigurationSection (Overview card + Edit button) — relates FR-2675
- [ ] FR-2677: Add DeploymentReplicasTab + Replica detail Drawer — blocked by FR-2667
- [ ] FR-2678: Add DeploymentRevisionHistoryTab + Rollback flow
- [ ] FR-2679: Add DeploymentAccessTokensTab (list + create + delete)
- [ ] FR-2680: Add DeploymentAutoScalingTab (wrap existing AutoScalingRuleList)

### Wave 4 — User-visible pages

- [ ] FR-2671: Add DeploymentListPage (user) — owns myDeployments query — blocked by FR-2670, FR-2664
- [ ] FR-2672: Add AdminDeploymentListPage + admin-only filters/columns (26.4.3+) — blocked by FR-2670, FR-2669, FR-2664
- [ ] FR-2681: Add DeploymentDetailPage (header + Overview + 4 tabs + URL tab sync) — blocked by FR-2676, FR-2677, FR-2678, FR-2679, FR-2680, FR-2668, FR-2664

### Wave 5 — Cleanup + consumer migration

- [ ] FR-2673: Remove legacy ServingPage and EndpointList / EndpointStatusTag — blocked by FR-2671, FR-2672
- [ ] FR-2682: Remove legacy EndpointDetailPage + related Endpoint components — blocked by FR-2681
- [ ] FR-2684: Migrate Deploy button sites to [Deploy | ▼] split button — blocked by FR-2683, FR-2675, FR-2664

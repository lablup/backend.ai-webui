# ReservoirArtifactDetailPage

- Route: `/admin/reservoir/:artifactId` (title "Artifact Details"), `access: 'admin'`; not gated by config `enableReservoir`.
- One reservoir artifact and its revisions, with importing a revision into a storage folder (`components/ImportArtifactRevisionToFolder*`).
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.

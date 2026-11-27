# ReservoirPage

- Route: `/admin/reservoir` (menu "Reservoir"), `access: 'admin'`; the menu item shows only with config `enableReservoir`, the route itself is not gated.
- Admin list of reservoir artifacts (models pulled from external registries), with scanning Hugging Face models (`components/ScanArtifactModelsFromHuggingFaceModal`); a row opens `ReservoirArtifactDetailPage`.
- Project-agnostic admin page (ADR 0001): `react/eslint.config.js` bans reading the ambient current project anywhere in this folder.

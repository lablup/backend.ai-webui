# VFolderNodeListPage

- Route: `/project/:projectName/data` (menu "Data"), any logged-in project member; lazy-loaded in `routes.tsx` but pre-warmed in `vite.config.ts` as a first screen.
- The user's storage folders with the active / trash split (`statusCategory` in the URL), create, move-to-trash, restore and delete-forever.

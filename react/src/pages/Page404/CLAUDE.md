# Page404

- Rendered for `/error`, by `UnknownRoutePage`, and by `RouteErrorBoundary` for a missing route; eagerly imported in `routes.tsx` and pre-warmed in `vite.config.ts`. Any logged-in user sees it, whatever the role.
- Not-found message with a way back (`RouteErrorContent`, shared with `ForbiddenPage`).

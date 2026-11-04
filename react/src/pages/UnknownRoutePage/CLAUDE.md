# UnknownRoutePage

- Rendered for the catch-all `*` route; eagerly imported in `routes.tsx`. Any logged-in user reaches it, whatever the role (`notFound` clears inherited `access`).
- Renders nothing until WebUI plugins have loaded, and nothing when the path belongs to a plugin page; otherwise shows `Page404`.

# vendor/

`lablup-ui-common-<version>.tgz` is a `pnpm pack` of
[`@lablup/ui-common`](https://github.com/lablup/ui-common), installed through a
`file:` spec until 0.2.0 is on the registry
([ADR 0009](../docs/adr/0009-ui-common-as-the-single-entry-point-to-astryx.md)).
A packed tarball installs the way a registry package does, so a second copy of
`@astryxdesign/core` shows up at install time instead of hiding behind a link.

pnpm catalogs reject `file:` specs, so the tarball is pinned by the
`"@lablup/ui-common"` entry under `overrides:` in `pnpm-workspace.yaml`. The
`catalog:` entry keeps the registry version the packages will move to.

## Swap in a newer tarball

```bash
# in the ui-common checkout
pnpm pack --pack-destination /tmp
# back here
git rm vendor/lablup-ui-common-<old>.tgz
cp /tmp/lablup-ui-common-<new>.tgz vendor/
# edit the one `overrides:` line in pnpm-workspace.yaml to the new file name
pnpm install
```

If the new ui-common pins a different Astryx version, move the
`@astryxdesign/*` catalog pins (and the patch files) to it in the same change;
otherwise a second core is installed.

## Cut over to the registry

Delete the `overrides:` line and this directory, set the catalog entry to the
published version, and run `pnpm install`.

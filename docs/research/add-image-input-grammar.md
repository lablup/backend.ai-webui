# Input grammar for "Add image" — NGC catalog URL, `docker pull` line, canonical forms

Research note for **FR-3934 / lablup/backend.ai-webui#9668**, under the map
**FR-3933 / #9667** ("Add image from NGC catalog URL / canonical via single-image
rescan").

The "Add image" modal takes a multi-line paste. Each line must resolve to one
`{registryHost, project, imageName, tag}` tuple and a `canonical` string that is
POSTed to `POST /admin/images/rescan` as `{canonical, architecture}`. This note
fixes what the parser accepts, what it rejects, and how the parsed prefix is
matched against the registered container registries.

Everything below was measured or read on **2026-09-14**. Redirect behaviour was
probed with `curl --max-redirs 0`; the nvcr.io mappings with anonymous manifest
pulls; the backend rules by reading `lablup/backend.ai` at the checkout in
`/home/ubuntu/Workspace/backend.ai` (read-only).

---

## 1. Summary of what the evidence changed

Five findings move the design, and three of them refine what the map's Notes
assumed:

1. **The catalog's copy button does not emit a `docker pull` line.** It emits the
   bare image reference with a concrete tag already substituted —
   `nvcr.io/nvidia/pytorch:26.08-py3` — even on a tag-less (`/-`) page. The
   `docker pull …` form the ticket asks about comes from READMEs and user habit,
   not from the catalog UI. Both must still be accepted. (§4)
2. **Backend.AI's Docker-Hub default repository is `lablup`, not `library`.**
   `default_repository = "lablup"` — `common/docker.py:73`. A bare `python:3.12`
   would mean `index.docker.io/lablup/python:3.12` to the backend, not the
   official image. (§6)
3. **The backend has no host-detection heuristic at all.** A dot or a port in the
   first path segment proves nothing: `parse_image_str` decides the first segment
   is a registry only by **string equality** with a registry you pass in, or by
   the segment being an IP literal — `common/docker.py:548-562`. Registry
   detection in the UI must therefore be a lookup against the registered
   registry rows, not a regex. (§6, §7)
4. **A canonical is matched by literal string prefix**, `canonical.startswith(registry_name + "/" + project + "/")`
   — `manager/repositories/image/db_source/db_source.py:591-599`. No
   normalisation, no Docker-Hub sugar. So every submitted line needs an explicit
   host that literally equals a registered `registry_name`. (§7)
5. **Overlapping registry rows are a hard failure, not a tie-break.** If both
   `nvcr.io`+`nvidia` and `nvcr.io`+`nvidia/clara` are registered, a canonical
   under `nvcr.io/nvidia/clara/**` matches *both* keys and `rescan_images` raises
   `RuntimeError("ContainerRegistryRows exist with the same registry_name and project!")`
   — `db_source.py:497-503`. The longest-prefix rule is therefore a **display**
   rule only; ambiguity must block submission. (§7)

---

## 2. Parser output shape

```ts
type ParsedLine = {
  kind: 'ngc-url' | 'pull-command' | 'canonical' | 'blank';
  registryHost: string | null;   // e.g. 'nvcr.io'
  project: string | null;        // resolved against registered registries
  imageName: string | null;      // remote path minus the resolved project
  tag: string | null;            // null === "missing"
  canonical: string | null;      // `${registryHost}/${project}/${imageName}:${tag}`
  submittable: boolean;
  reason: string | null;         // machine code; null iff submittable
};
```

`submittable` means "this line can be POSTed as-is". A line that parses cleanly
but has no tag is **not** submittable — the map fixed that: the tag is a required
input and is never defaulted to `latest`, because NGC official images have no
`latest` tag (verified again in §5).

---

## 3. NGC catalog URL grammar (curl evidence)

### 3.1 Canonical page form

```
https://catalog.ngc.nvidia.com/orgs/{org}/{team|-}/containers/{name}/{version|-}[/{tags|layers}[/{tag}]][?query]
```

`-` is the placeholder for "no team" and "no version". Both
`catalog.ngc.nvidia.com` and `ngc.nvidia.com` serve it.

### 3.2 Short forms all 302 to the canonical form

Probed with `curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' --max-redirs 0 <url>`:

| Input URL | Code | `Location` |
|---|---|---|
| `…/orgs/nvidia/containers/tritonserver` | 302 | `…/orgs/nvidia/-/containers/tritonserver/-?_lr=1` |
| `…/orgs/nvidia/containers/tritonserver/` (trailing slash) | 302 | `…/orgs/nvidia/-/containers/tritonserver/-?_lr=1` |
| `…/orgs/nvidia/containers/pytorch/tags` | 302 | `…/orgs/nvidia/-/containers/pytorch/-/tags?_lr=1` |
| `…/orgs/nvidia/containers/pytorch/tags/25.01-py3` | 302 | `…/orgs/nvidia/-/containers/pytorch/-/tags/25.01-py3?_lr=1` |
| `…/orgs/nvidia/containers/pytorch/tags/25.01-py3?utm_source=x` | 302 | `…/orgs/nvidia/-/containers/pytorch/-/tags/25.01-py3?utm_source=x&_lr=1` |
| `…/orgs/nvidia/-/containers/pytorch` (4 segments) | 302 | `…/orgs/nvidia/-/containers/pytorch/-` |
| `…/orgs/nvidia/teams/clara/containers/monai-toolkit` | 302 | `…/orgs/nvidia/clara/containers/monai-toolkit/-?_lr=1` |
| `…/orgs/nvidia/teams/clara/containers/monai-toolkit/tags/2.4` | 302 | `…/orgs/nvidia/clara/containers/monai-toolkit/-/tags/2.4?_lr=1` |
| `…/orgs/nvidia/teams/nemo/containers/nemo` | 302 | `…/orgs/nvidia/nemo/containers/nemo/-?_lr=1` |
| `…/orgs/nvidia/teams/riva/containers/riva-speech` | 302 | `…/orgs/nvidia/riva/containers/riva-speech/-?_lr=1` |
| `…/orgs/nim/teams/meta/containers/llama-3.1-8b-instruct` | 302 | `…/orgs/nim/meta/containers/llama-3.1-8b-instruct/-?_lr=1` |
| `…/orgs/partners/teams/gridai/containers/pytorch-lightning` | 302 | `…/orgs/partners/gridai/containers/pytorch-lightning/-?_lr=1` |

So `teams/{team}` in a short form is the **same slot** as the `{team|-}`
placeholder in the canonical form. That is the whole team rule.

200 (already canonical, no redirect):

```
…/orgs/nvidia/-/containers/pytorch/-                      200
…/orgs/nvidia/-/containers/pytorch/-/                     200   (trailing slash)
…/orgs/nvidia/-/containers/pytorch/25.01-py3              200
…/orgs/nvidia/-/containers/pytorch/-/tags?_lr=1           200
…/orgs/nvidia/-/containers/pytorch/-/layers               200
…/orgs/nvidia/-/containers/pytorch/-?version=25.01-py3    200
…/orgs/nvidia/clara/containers/monai-toolkit/-            200
…/orgs/nvidia/clara/containers/monai-toolkit/2.4          200
…/orgs/nim/meta/containers/llama-3.1-8b-instruct/-        200
…/orgs/nvidia/-/containers/cuda/12.6.0-devel-ubuntu24.04  200
```

### 3.3 Two places a tag can live

Both are real and both must be read:

- the **version segment**: `…/containers/{name}/{version}` — `…/containers/pytorch/25.01-py3`
- the **tags deep link**: `…/containers/{name}/-/tags/{tag}` — produced whenever
  the user copies a URL off the Tags table

Precedence: if the version segment is not `-`, use it; otherwise, if a
`/tags/{tag}` suffix is present, use that; otherwise the tag is **missing**.

### 3.4 Suffixes and query strings

`/tags`, `/tags/{tag}` and `/layers` are the live suffixes (200). `/overview`
and `/security` 404, so there is no long tail to enumerate — the parser should
read `/tags/{tag}` and otherwise **ignore any trailing segments**.

Query strings never carry the identity and are ignored. Note `?_lr=1` is a
loop-guard the redirector adds: a **short form that already carries `_lr=1`
404s instead of redirecting** (`…/orgs/nvidia/containers/pytorch?_lr=1` → 404).
That is a server-side detail only; the parser is purely syntactic and must still
accept such a pasted URL.

### 3.5 Legacy `ngc.nvidia.com` URLs

```
https://ngc.nvidia.com/catalog/containers/nvidia:tritonserver
  301 -> https://catalog.ngc.nvidia.com/orgs/nvidia/containers/tritonserver
https://ngc.nvidia.com/catalog/containers/nvidia:pytorch/tags
  301 -> https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags
https://ngc.nvidia.com/catalog/containers/nvidia:clara:monai-toolkit
  301 -> https://catalog.ngc.nvidia.com/orgs/nvidia/teams/clara/containers/monai-toolkit
```

So the legacy colon form is `{org}[:{team}]:{name}`, and a trailing `/tags` is
preserved. `ngc.nvidia.com/orgs/nvidia/containers/pytorch` (new path on the old
host) serves 200 directly.

`https://catalog.ngc.nvidia.com/containers/nvidia:pytorch` → 404; that form does
not exist.

### 3.6 Non-container resource types

Models, collections, resources and helm charts share the URL shape and must be
rejected by resource type, not by shape:

```
…/orgs/nvidia/models/nvidia_hifigan    302 -> …/orgs/nvidia/-/models/nvidia_hifigan/-?_lr=1
…/orgs/nvidia/collections/nemo_asr     302 -> …/orgs/nvidia/-/collections/nemo_asr/-?_lr=1
…/orgs/nvidia/resources/nemo           302 -> …/orgs/nvidia/-/resources/nemo/-?_lr=1
…/orgs/nvidia/helm-charts/riva-api     302 -> …/orgs/nvidia/-/helm-charts/riva-api/-?_lr=1
…/containers                           302 -> …/search?sort=weightPopularDESC&resourceType=container
```

Only `containers` is accepted.

---

## 4. `nvcr.io` mapping — confirmed by manifest pulls

Anonymous token from `https://nvcr.io/proxy_auth?scope=repository:<repo>:pull`,
then `GET https://nvcr.io/v2/<repo>/manifests/<tag>` with
`Accept: application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.v2+json`:

| Repository | Tag | HTTP | `mediaType` |
|---|---|---|---|
| `nvidia/clara/monai-toolkit` (team) | `1.0` | **200** | `application/vnd.docker.distribution.manifest.v2+json` |
| `nim/meta/llama-3.1-8b-instruct` (nim org) | `1.8.6` | **200** | `application/vnd.docker.distribution.manifest.list.v2+json` |
| `nim/meta/llama-3.1-8b-instruct` | `latest` | **200** | `application/vnd.oci.image.index.v1+json` |
| `nvidia/pytorch` (no team) | `25.01-py3` | **200** | `…manifest.list.v2+json` |
| `nvidia/tritonserver` (no team) | `25.01-py3` | **200** | `…manifest.list.v2+json` |
| `nvidia/pytorch` | `latest` | **404** | — |

So the team **is** a path segment on nvcr.io:

```
catalog  orgs/{org}/{team|-}/containers/{name}/{tag}
nvcr.io  nvcr.io/{org}[/{team}]/{name}:{tag}
```

NGC's own API agrees — `GET https://api.ngc.nvidia.com/v2/repos/nvidia/clara/monai-toolkit`
returns `"namespace":"nvidia/clara","name":"monai-toolkit"`, while
`…/v2/repos/nvidia/pytorch` returns `"namespace":"nvidia","name":"pytorch"`.
NGC itself calls `{org}[/{team}]` the *namespace*.

### The `latest` question, re-verified

`GET https://nvcr.io/v2/<repo>/tags/list`:

| Repository | tag count | has `latest` |
|---|---|---|
| `nvidia/pytorch` | 640 | **no** |
| `nvidia/clara/monai-toolkit` | 67 | **no** |
| `nim/meta/llama-3.1-8b-instruct` | 163 | **yes** |

NVIDIA's own container lines still have no `latest` (confirming the map's
decision to never default it), but NIM images do. So "missing tag" must be a
prompt, never an assumption, and must not be special-cased per org.

### What the copy button actually produces

The catalog page ships the copy widget server-rendered. On
`…/orgs/nvidia/-/containers/pytorch/-`:

```html
<label …>Copy the image path for this tag below:</label>
<div class="nv-input-shell …">
  <input id="…" type="text" readOnly="" class="font-mono text-ellipsis"
         value="nvcr.io/nvidia/pytorch:26.08-py3"/>
  <button … aria-label="Copy to clipboard" …>
```

- The string `docker pull` appears **zero times** in the HTML of the pytorch
  page, the NIM page, and the Tags page.
- On a **tag-less** (`/-`) page the widget still carries a **concrete tag** —
  `nvcr.io/nvidia/pytorch:26.08-py3` (the newest), and
  `nvcr.io/nim/meta/llama-3.1-8b-instruct:latest` for NIM.
- The Tags page carries one widget per row:
  `nvcr.io/nvidia/pytorch:26.01-py3`, `…:26.02-py3-igpu`, … `…:26.08-py3`.

So the highest-volume paste is a **bare canonical with a tag**, which is the
easy case. `docker pull …` is still accepted because READMEs and users produce
it.

---

## 5. Reference grammar for canonical strings

Primary source: `github.com/distribution/reference`, `reference.go` package doc
(fetched 2026-09-14):

```
reference       := name [ ":" tag ] [ "@" digest ]
name            := [domain '/'] remote-name
domain          := host [':' port-number]
host            := domain-name | IPv4address | \[ IPv6address \]
path-component  := alpha-numeric [separator alpha-numeric]*
path            := path-component ['/' path-component]*
alpha-numeric   := /[a-z0-9]+/
separator       := /[_.]|__|[-]*/
tag             := /[\w][\w.-]{0,127}/
digest          := digest-algorithm ":" digest-hex
```

and `normalize.go:146-176` (`splitDockerDomain`) for the upstream host
heuristic: a first segment is a domain iff it is `localhost`, contains `.` or
`:`, or is not all-lowercase. **Backend.AI does not implement this heuristic**
(§6) — it is quoted here only because it is what a user's mental model is, and
because it explains why `python:3.12` reads as an image and not a host.

Two Backend.AI deltas bind tighter than the upstream grammar:

- **Tag charset**: `rx_slug = ^[A-Za-z0-9](?:[A-Za-z0-9-._]*[A-Za-z0-9])?$`
  — `common/docker.py:78`, enforced at `docker.py:574`. Stricter than upstream:
  a tag may not start or end with `-`, `.` or `_`, and `_` is not allowed at
  all in the interior beyond what the class permits. Uppercase **is** allowed in
  a tag.
- **Image name**: not validated by any regex server-side (`rx_slug` is used
  exactly once, for the tag). Any name check the UI adds is a UI-only courtesy.

---

## 6. Backend parsing rules (`lablup/backend.ai`, read-only)

### `ImageRef.parse_image_str` — `src/ai/backend/common/docker.py:524-581`

```python
545          if "://" in image_str or image_str.startswith("//"):
546              raise InvalidImageName(image_str)
548          def divide_parts(image_str, registry):
549              if "/" not in image_str:
550                  return (default_registry, image_str)
552              maybe_registry, maybe_project_and_image_name = image_str.split("/", maxsplit=1)
554              if (registry == maybe_registry
556                  or registry == "*"
557                  or is_ip_address_format(maybe_registry)):
559                  return (maybe_registry, maybe_project_and_image_name)
560              if registry is None:
561                  return (default_registry, image_str)
562              return (registry, image_str)
566          using_default_repository = (registry_part.endswith(".docker.io")
567                                      or registry_part == "docker.io")
574          if not rx_slug.search(tag):
575              raise InvalidImageTag(tag, image_str)
```

Consequences for the UI:

- A URL scheme in a canonical is a **hard error** (`545-546`). `https://nvcr.io/…`
  pasted as if it were a canonical must be rejected, not stripped silently.
- There is **no dot/port heuristic**. With `registry=None`, `myregistry.org/lua`
  parses as registry `index.docker.io` and name `myregistry.org/lua` — asserted
  in `tests/unit/common/test_docker.py:173-177`. The only automatic host
  detection is `is_ip_address_format` (`common/utils.py:556-561`), which covers
  `127.0.0.1:5000`, `[::1]`, `[::1]:5000` but **not** a bare `::1`.
- A host with a non-standard port only works when it is the registry you pass:
  `parse_image_str("myregistry.org:999/mybase/python:…", "myregistry.org:999")`
  — `test_docker.py:192-198`.

### `ImageRef.parse_image_tag` — `docker.py:502-522`

```python
511          image_tag = image_str.rsplit(":", maxsplit=1)
512          if len(image_tag) == 1:
514              tag = "latest"
518          if not image_str:
519              raise InvalidImageName("Empty image repository/name")
520          if ("/" not in image_str) and using_default_repository:
521              image_str = default_repository + "/" + image_str
```

- No tag ⇒ `latest` (server-side). The UI deliberately does **not** rely on this.
- `default_repository = "lablup"` — `docker.py:73`. Not `library`. So a bare
  `python:3.12` means `index.docker.io/lablup/python:3.12` to Backend.AI, which
  is a different image from Docker Hub's official `library/python`.
- **Digests are not handled.** `"@"` and `"digest"` appear nowhere in
  `docker.py`. `nvcr.io/nvidia/x@sha256:abc…` `rsplit(":")`s into name
  `nvcr.io/nvidia/x@sha256` and tag `abc…`; a 64-hex digest is all-alphanumeric
  so it **passes `rx_slug` at `:574`** and parses *silently wrong* instead of
  raising. The UI must reject `@sha256:` itself — the backend will not.

### `ImageRef.from_image_str` — `docker.py:467-500`

```python
483          if not project:
484              image_name = parsed.project_and_image_name
485          elif parsed.project_and_image_name == project:
486              image_name = ""
488              if not parsed.project_and_image_name.startswith(f"{project}/"):
489                  raise ProjectMismatchWithCanonical(project, parsed.canonical)
491              image_name = parsed.project_and_image_name.split(f"{project}/", maxsplit=1)[1]
```

The project is **an input, never inferred**. `parse_image_str`'s own docstring
says so at `docker.py:541-542`: *"`ParsedImageStr` can not distinguish the
project and the image name."* Multi-segment projects are explicitly supported
(`test_docker.py:262-269` uses project `"project/sub"`; `:345-348` uses
`"user/workspace/python"`).

### The API the modal posts to

`POST /admin/images/rescan`, superadmin-gated —
`manager/api/rest/image/registry.py:16-26` (`RouteRegistry.create("images", …)`,
`reg.add("POST", "/rescan", handler.rescan, middlewares=[auth_required, superadmin_required])`),
handler at `manager/api/rest/image/handler.py:88-102`. Body is
`RescanImagesRequest` — `common/dto/manager/image/request.py:61-65`:
`canonical: str` + `architecture: str`, nothing else. There is **no** separate
registry / project / name / tag field and **no** create-image GraphQL mutation
(the `RescanImages` mutation at `manager/api/gql_legacy/image.py:967-976` takes
only `registry` + `project`).

So the parser's split exists for the **preview and the Add-registry prefill**.
The wire format is one string.

---

## 7. Registry-matching rule

### What the backend does

`manager/repositories/image/db_source/db_source.py:533-554` builds one key per
registry row:

```python
536          join = functools.partial(join_non_empty, sep="/")
544                  join(row.registry_name, row.project): row
```

`join_non_empty` drops falsy parts (`common/utils.py:564-569`), so a row with
`project` NULL or `""` keys as just `registry_name`.

`db_source.py:591-599`:

```python
591      @classmethod
592      def _filter_by_img_canonical(cls, registries, registry_or_image):
595          """Filter registries assuming ``registry_or_image`` is an image canonical name."""
596          return cls._filter_registry_dict(
597              registries,
598              lambda registry_key, _row: registry_or_image.startswith(registry_key + "/"),
599          )
```

Pure Python `str.startswith`, in memory, over every `container_registries` row.
No SQL comparison and no `project IS NULL` special case — a NULL-project row
simply degenerates to `canonical.startswith("nvcr.io/")`.

The only caller, `db_source.py:477-514`:

```python
497          matching_registries = self._filter_by_img_canonical(registries, registry_or_image)
499          if matching_registries:
500              if len(matching_registries) > 1:
501                  raise RuntimeError(
502                      "ContainerRegistryRows exist with the same registry_name and project!",
503                  )
505              registry_key, registry_row = next(iter(matching_registries.items()))
506              return await self.scan_single_image(registry_key, registry_row, registry_or_image)
508          matching_registries = self._filter_by_registry_name(registries, registry_or_image)
510          if not matching_registries:
511              raise RuntimeError("It is an unknown registry.", registry_or_image)
```

`ContainerRegistryRow.project` is nullable —
`manager/models/container_registry/row.py:132-134`. For **Harbor** rows it is
required and must match `^[a-z0-9]+(?:[._-][a-z0-9]+)*$` (`row.py:87-95`), which
**forbids `/`** — a multi-segment project is only possible on `DOCKER`-type rows,
which is what an `nvcr.io` row is.

### `nvcr.io/nvidia/clara/monai-toolkit:1.0` against three row shapes

| Registry row | key | matches? | `project` | `imageName` |
|---|---|---|---|---|
| `nvcr.io` + `nvidia` | `nvcr.io/nvidia` | yes | `nvidia` | `clara/monai-toolkit` |
| `nvcr.io` + `nvidia/clara` | `nvcr.io/nvidia/clara` | yes | `nvidia/clara` | `monai-toolkit` |
| `nvcr.io` + NULL | `nvcr.io` | yes | `null` | `nvidia/clara/monai-toolkit` |

The **canonical string is identical in all three** —
`ImageRef.canonical` re-joins with `/` (`docker.py:656-660`) — so the split never
changes what is POSTed. It changes what the preview shows and which registry
credentials are used. (It also changes the `images` row's `project` column, part
of `uq_image_identifier` at `manager/models/image/row.py:157-160`, so the same
image registered under two differently-projected rows becomes two rows.)

### The rule the parser implements

1. Find every registered registry whose key `join_non_empty(registry_name, project, "/")`
   satisfies `canonical.startsWith(key + "/")`. Compare **literally**; do not
   normalise `docker.io` ↔ `index.docker.io`, do not insert `library/`.
2. **Zero matches** → `submittable: false`, `reason: "registry_not_registered"`.
   Show the parsed host and offer the Add-registry modal prefilled with
   `registryHost` and the first remote-path segment as the project.
3. **Exactly one match** → `project = row.project`, `imageName = remotePath.slice(project.length + 1)`
   (or the whole remote path when `project` is null). Submittable if a tag is
   present.
4. **More than one match** → `submittable: false`,
   `reason: "registry_ambiguous"`. Longest-prefix is the right rule for what to
   *show* in the preview, but it must not be used to submit: the backend raises
   `RuntimeError` at `db_source.py:500-503` before scanning anything. Surface the
   competing rows and let the admin fix the registry list.

Point 4 is a failure mode the map's Notes did not have. The Notes say "one
`nvcr.io` + `nvidia` row covers every `nvcr.io/nvidia/**` image", which is true;
what is new is that *adding* an `nvcr.io` + `nvidia/clara` row alongside it
breaks every `nvcr.io/nvidia/clara/**` rescan.

### Docker Hub short names are not submittable

Because matching is a literal prefix test against the canonical, a line with no
host — `python:3.12`, `library/python:3.12` — matches no registry key, falls
through to `_filter_by_registry_name` (`db_source.py:508`), matches nothing there
either, and dies on `RuntimeError("It is an unknown registry.")` at
`db_source.py:510-511`. Compounding it, the backend's own short-name expansion
would produce `index.docker.io/lablup/python`, not `library/python`
(`docker.py:73`, `:520-521`).

So the parser **parses** a short name (so the preview can explain it) but marks
it `submittable: false` with `reason: "host_required"`, and the hint is to write
the full canonical — e.g. `index.docker.io/library/python:3.12` — provided a
matching registry row exists.

---

## 8. Grammar table

`H` = registryHost, `P` = project, `N` = imageName, `T` = tag.
"registry-resolved" means P/N come from the §7 match, not from the string.

| # | Form | Example | H | P / N | T | Submittable |
|---|---|---|---|---|---|---|
| G1 | NGC canonical page, no team, no version | `https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-` | `nvcr.io` | `nvidia` / `pytorch` | missing | no — `tag_required` |
| G2 | NGC canonical page, version segment | `…/orgs/nvidia/-/containers/pytorch/25.01-py3` | `nvcr.io` | `nvidia` / `pytorch` | `25.01-py3` | yes |
| G3 | NGC canonical page, team | `…/orgs/nvidia/clara/containers/monai-toolkit/2.4` | `nvcr.io` | `nvidia/clara` / `monai-toolkit` * | `2.4` | yes |
| G4 | NGC short form | `…/orgs/nvidia/containers/pytorch` | `nvcr.io` | `nvidia` / `pytorch` | missing | no — `tag_required` |
| G5 | NGC short form with `teams/` | `…/orgs/nvidia/teams/clara/containers/monai-toolkit` | `nvcr.io` | `nvidia/clara` / `monai-toolkit` * | missing | no — `tag_required` |
| G6 | NGC `/tags` suffix | `…/orgs/nvidia/containers/pytorch/tags` | `nvcr.io` | `nvidia` / `pytorch` | missing | no — `tag_required` |
| G7 | NGC `/tags/{tag}` deep link | `…/orgs/nvidia/containers/pytorch/tags/25.01-py3` | `nvcr.io` | `nvidia` / `pytorch` | `25.01-py3` | yes |
| G8 | NGC `/layers` suffix | `…/orgs/nvidia/-/containers/pytorch/-/layers` | `nvcr.io` | `nvidia` / `pytorch` | missing | no — `tag_required` |
| G9 | NGC + any query string / trailing slash | `…/containers/pytorch/-?_lr=1`, `…/-/` | as above | as above | as above | as above |
| G10 | NGC `nim` org | `…/orgs/nim/meta/containers/llama-3.1-8b-instruct/1.8.6` | `nvcr.io` | `nim/meta` / `llama-3.1-8b-instruct` * | `1.8.6` | yes |
| G11 | Legacy `ngc.nvidia.com/catalog/containers/{org}:{name}` | `https://ngc.nvidia.com/catalog/containers/nvidia:pytorch` | `nvcr.io` | `nvidia` / `pytorch` | missing | no — `tag_required` |
| G12 | Legacy with team | `…/catalog/containers/nvidia:clara:monai-toolkit` | `nvcr.io` | `nvidia/clara` / `monai-toolkit` * | missing | no — `tag_required` |
| G13 | NGC URL without scheme | `catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/25.01-py3` | `nvcr.io` | `nvidia` / `pytorch` | `25.01-py3` | yes |
| P1 | `docker pull <ref>` | `docker pull nvcr.io/nvidia/pytorch:25.01-py3` | `nvcr.io` | registry-resolved | `25.01-py3` | yes |
| P2 | `podman pull <ref>` | `podman pull nvcr.io/nvidia/clara/monai-toolkit:2.4` | `nvcr.io` | registry-resolved | `2.4` | yes |
| P3 | shell prompt / `sudo` prefix | `$ sudo docker pull nvcr.io/nvidia/pytorch:25.01-py3` | `nvcr.io` | registry-resolved | `25.01-py3` | yes |
| P4 | pull line without a tag | `docker pull nvcr.io/nvidia/pytorch` | `nvcr.io` | registry-resolved | missing | no — `tag_required` |
| C1 | canonical with tag | `nvcr.io/nvidia/pytorch:25.01-py3` | `nvcr.io` | `nvidia` / `pytorch` | `25.01-py3` | yes |
| C2 | canonical, multi-segment remote path | `nvcr.io/nvidia/clara/monai-toolkit:2.4` | `nvcr.io` | registry-resolved | `2.4` | yes |
| C3 | canonical without tag | `nvcr.io/nvidia/pytorch` | `nvcr.io` | `nvidia` / `pytorch` | missing | no — `tag_required` |
| C4 | host with port | `harbor.local:5000/proj/name:1.0` | `harbor.local:5000` | `proj` / `name` | `1.0` | yes |
| C5 | host with port, multi-segment project | `harbor.local:5000/proj/sub/name:1.0` | `harbor.local:5000` | registry-resolved | `1.0` | yes |
| C6 | Backend.AI default registry | `cr.backend.ai/stable/python:3.9-ubuntu20.04` | `cr.backend.ai` | `stable` / `python` | `3.9-ubuntu20.04` | yes |
| C7 | IP-literal host | `127.0.0.1:5000/proj/name:1.0` | `127.0.0.1:5000` | registry-resolved | `1.0` | yes (if registered) |
| C8 | explicit Docker Hub canonical | `index.docker.io/library/python:3.12` | `index.docker.io` | `library` / `python` | `3.12` | yes (if registered) |
| C9 | Docker Hub short name | `python:3.12` | — | — | `3.12` | **no — `host_required`** |
| C10 | Docker Hub `library/` short name | `library/python:3.12` | — | — | `3.12` | **no — `host_required`** |
| C11 | `docker.io/…` | `docker.io/library/python:3.12` | `docker.io` | `library` / `python` | `3.12` | only if a row's `registry_name` is literally `docker.io` |

\* Whether `nvidia/clara` is the project or `nvidia` is the project and
`clara/monai-toolkit` the name depends on the registered rows (§7). The table
shows the split for a registry list in which the longer key is registered; the
canonical posted is the same either way.

---

## 9. Reject list

| Reason code | Trigger | Message intent |
|---|---|---|
| `tag_required` | Parsed fine, no tag anywhere in the input | "Enter a tag." NGC official images have no `latest` (§4); never default it. |
| `digest_unsupported` | `@sha256:` (or any `@<alg>:`) in the reference | Backend.AI's `parse_image_tag` (`docker.py:502-522`) has no digest handling and **misparses digests without raising** — reject in the UI. Ask for a tag. |
| `scheme_in_canonical` | `://` or a leading `//` in something parsed as a canonical | `parse_image_str` raises `InvalidImageName` (`docker.py:545-546`). Only NGC catalog URLs may carry a scheme. |
| `host_required` | No registry host — `python:3.12`, `library/python:3.12` | Matching is a literal prefix test (`db_source.py:598`); a host-less line matches no row. Also, the backend's own short-name default is `lablup/`, not `library/` (`docker.py:73`). |
| `registry_not_registered` | Host parsed, no registered row keys it | Offer the Add-registry modal, prefilled. |
| `registry_ambiguous` | Two or more registry keys prefix the canonical | `rescan_images` raises `RuntimeError` (`db_source.py:500-503`) before scanning. Fix the registry list first. |
| `invalid_tag` | Tag fails `^[A-Za-z0-9](?:[A-Za-z0-9-._]*[A-Za-z0-9])?$` or is empty or >128 chars | `rx_slug`, `docker.py:78`, enforced at `:574` (`InvalidImageTag`). |
| `invalid_reference` | Empty path component (`nvcr.io//nvidia/x`), trailing `/`, uppercase in the path, no `/` after the host, or any char outside the distribution grammar | `reference.go` grammar (§5). The backend does not validate the name, so the UI is the only gate. |
| `empty_image_name` | Remote path empty after stripping the host (`nvcr.io`, `nvcr.io/`) | `parse_image_tag` raises `InvalidImageName("Empty image repository/name")` (`docker.py:518-519`). |
| `ngc_not_a_container` | NGC URL whose resource type is `models` / `collections` / `resources` / `helm-charts` | Only `containers` can be registered (§3.6). |
| `ngc_url_unparseable` | NGC host but the path is not an image page — `/search?…`, `/containers`, bare `/orgs/nvidia` | Point at the image's page. |
| `unsupported_command` | A command line that is not a `pull` — `docker run …`, `docker build …`, `helm install …` | Only `docker pull` / `podman pull` are stripped. |
| *(blank)* | Empty or whitespace-only line | Skipped silently; not an error in a multi-line paste. |

---

## 10. Test vectors

Fixture-ready. `registries` is the default registered-registry list every vector
is resolved against unless the vector carries its own `registries`.

```json
{
  "registries": [
    { "registry_name": "nvcr.io", "project": "nvidia" },
    { "registry_name": "nvcr.io", "project": "nim/meta" },
    { "registry_name": "cr.backend.ai", "project": "stable" },
    { "registry_name": "index.docker.io", "project": "library" },
    { "registry_name": "harbor.local:5000", "project": "proj" },
    { "registry_name": "mirror.internal", "project": null }
  ],
  "vectors": [
    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/25.01-py3",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags/25.01-py3",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-/tags/25.01-py3?utm_source=x&_lr=1",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-/layers",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-?_lr=1",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/cuda/12.6.0-devel-ubuntu24.04",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "cuda", "tag": "12.6.0-devel-ubuntu24.04", "canonical": "nvcr.io/nvidia/cuda:12.6.0-devel-ubuntu24.04", "submittable": true, "reason": null } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/teams/clara/containers/monai-toolkit",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "clara/monai-toolkit", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/clara/containers/monai-toolkit/2.4",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "clara/monai-toolkit", "tag": "2.4", "canonical": "nvcr.io/nvidia/clara/monai-toolkit:2.4", "submittable": true, "reason": null } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/teams/clara/containers/monai-toolkit/tags/2.4",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "clara/monai-toolkit", "tag": "2.4", "canonical": "nvcr.io/nvidia/clara/monai-toolkit:2.4", "submittable": true, "reason": null } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nim/teams/meta/containers/llama-3.1-8b-instruct",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nim/meta", "imageName": "llama-3.1-8b-instruct", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nim/meta/containers/llama-3.1-8b-instruct/1.8.6",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nim/meta", "imageName": "llama-3.1-8b-instruct", "tag": "1.8.6", "canonical": "nvcr.io/nim/meta/llama-3.1-8b-instruct:1.8.6", "submittable": true, "reason": null } },

    { "input": "https://ngc.nvidia.com/catalog/containers/nvidia:pytorch",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://ngc.nvidia.com/catalog/containers/nvidia:clara:monai-toolkit",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "clara/monai-toolkit", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "https://ngc.nvidia.com/orgs/nvidia/containers/pytorch/tags/25.01-py3",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/25.01-py3",
      "expected": { "kind": "ngc-url", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/models/nvidia_hifigan",
      "expected": { "kind": "ngc-url", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "ngc_not_a_container" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/-/collections/nemo_asr/-",
      "expected": { "kind": "ngc-url", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "ngc_not_a_container" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/resources/nemo",
      "expected": { "kind": "ngc-url", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "ngc_not_a_container" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia/helm-charts/riva-api",
      "expected": { "kind": "ngc-url", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "ngc_not_a_container" } },

    { "input": "https://catalog.ngc.nvidia.com/search?q=pytorch",
      "expected": { "kind": "ngc-url", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "ngc_url_unparseable" } },

    { "input": "https://catalog.ngc.nvidia.com/containers",
      "expected": { "kind": "ngc-url", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "ngc_url_unparseable" } },

    { "input": "https://catalog.ngc.nvidia.com/orgs/nvidia",
      "expected": { "kind": "ngc-url", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "ngc_url_unparseable" } },

    { "input": "docker pull nvcr.io/nvidia/pytorch:25.01-py3",
      "expected": { "kind": "pull-command", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "$ docker pull nvcr.io/nvidia/pytorch:25.01-py3",
      "expected": { "kind": "pull-command", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "$ sudo docker pull   nvcr.io/nvidia/pytorch:25.01-py3   ",
      "expected": { "kind": "pull-command", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "podman pull nvcr.io/nvidia/clara/monai-toolkit:2.4",
      "expected": { "kind": "pull-command", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "clara/monai-toolkit", "tag": "2.4", "canonical": "nvcr.io/nvidia/clara/monai-toolkit:2.4", "submittable": true, "reason": null } },

    { "input": "docker pull nvcr.io/nvidia/pytorch",
      "expected": { "kind": "pull-command", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "docker pull nvcr.io/nvidia/pytorch@sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "expected": { "kind": "pull-command", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "digest_unsupported" } },

    { "input": "docker run --gpus all -it nvcr.io/nvidia/pytorch:25.01-py3",
      "expected": { "kind": "pull-command", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "unsupported_command" } },

    { "input": "nvcr.io/nvidia/pytorch:25.01-py3",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": "nvcr.io/nvidia/pytorch:25.01-py3", "submittable": true, "reason": null } },

    { "input": "nvcr.io/nvidia/pytorch:26.08-py3",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "26.08-py3", "canonical": "nvcr.io/nvidia/pytorch:26.08-py3", "submittable": true, "reason": null } },

    { "input": "nvcr.io/nvidia/clara/monai-toolkit:2.4",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "clara/monai-toolkit", "tag": "2.4", "canonical": "nvcr.io/nvidia/clara/monai-toolkit:2.4", "submittable": true, "reason": null } },

    { "input": "nvcr.io/nim/meta/llama-3.1-8b-instruct:latest",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nim/meta", "imageName": "llama-3.1-8b-instruct", "tag": "latest", "canonical": "nvcr.io/nim/meta/llama-3.1-8b-instruct:latest", "submittable": true, "reason": null } },

    { "input": "nvcr.io/nvidia/pytorch",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "tag_required" } },

    { "input": "cr.backend.ai/stable/python:3.9-ubuntu20.04",
      "expected": { "kind": "canonical", "registryHost": "cr.backend.ai", "project": "stable", "imageName": "python", "tag": "3.9-ubuntu20.04", "canonical": "cr.backend.ai/stable/python:3.9-ubuntu20.04", "submittable": true, "reason": null } },

    { "input": "harbor.local:5000/proj/name:1.0",
      "expected": { "kind": "canonical", "registryHost": "harbor.local:5000", "project": "proj", "imageName": "name", "tag": "1.0", "canonical": "harbor.local:5000/proj/name:1.0", "submittable": true, "reason": null } },

    { "input": "harbor.local:5000/proj/sub/name:1.0",
      "expected": { "kind": "canonical", "registryHost": "harbor.local:5000", "project": "proj", "imageName": "sub/name", "tag": "1.0", "canonical": "harbor.local:5000/proj/sub/name:1.0", "submittable": true, "reason": null } },

    { "input": "mirror.internal/team/group/app:1.0",
      "expected": { "kind": "canonical", "registryHost": "mirror.internal", "project": null, "imageName": "team/group/app", "tag": "1.0", "canonical": "mirror.internal/team/group/app:1.0", "submittable": true, "reason": null } },

    { "input": "index.docker.io/library/python:3.12",
      "expected": { "kind": "canonical", "registryHost": "index.docker.io", "project": "library", "imageName": "python", "tag": "3.12", "canonical": "index.docker.io/library/python:3.12", "submittable": true, "reason": null } },

    { "input": "docker.io/library/python:3.12",
      "expected": { "kind": "canonical", "registryHost": "docker.io", "project": null, "imageName": null, "tag": "3.12", "canonical": null, "submittable": false, "reason": "registry_not_registered" } },

    { "input": "python:3.12",
      "expected": { "kind": "canonical", "registryHost": null, "project": null, "imageName": "python", "tag": "3.12", "canonical": null, "submittable": false, "reason": "host_required" } },

    { "input": "library/python:3.12",
      "expected": { "kind": "canonical", "registryHost": null, "project": null, "imageName": "library/python", "tag": "3.12", "canonical": null, "submittable": false, "reason": "host_required" } },

    { "input": "python",
      "expected": { "kind": "canonical", "registryHost": null, "project": null, "imageName": "python", "tag": null, "canonical": null, "submittable": false, "reason": "host_required" } },

    { "input": "ghcr.io/acme/app:1.0",
      "expected": { "kind": "canonical", "registryHost": "ghcr.io", "project": null, "imageName": null, "tag": "1.0", "canonical": null, "submittable": false, "reason": "registry_not_registered" } },

    { "input": "nvcr.io/nvidia/clara/monai-toolkit:2.4",
      "registries": [
        { "registry_name": "nvcr.io", "project": "nvidia" },
        { "registry_name": "nvcr.io", "project": "nvidia/clara" }
      ],
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia/clara", "imageName": "monai-toolkit", "tag": "2.4", "canonical": null, "submittable": false, "reason": "registry_ambiguous" } },

    { "input": "nvcr.io/nvidia/clara/monai-toolkit:2.4",
      "registries": [ { "registry_name": "nvcr.io", "project": "nvidia/clara" } ],
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia/clara", "imageName": "monai-toolkit", "tag": "2.4", "canonical": "nvcr.io/nvidia/clara/monai-toolkit:2.4", "submittable": true, "reason": null } },

    { "input": "nvcr.io/nvidia/clara/monai-toolkit:2.4",
      "registries": [ { "registry_name": "nvcr.io", "project": null } ],
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": null, "imageName": "nvidia/clara/monai-toolkit", "tag": "2.4", "canonical": "nvcr.io/nvidia/clara/monai-toolkit:2.4", "submittable": true, "reason": null } },

    { "input": "nvcr.io/nvidia/pytorch@sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": null, "canonical": null, "submittable": false, "reason": "digest_unsupported" } },

    { "input": "nvcr.io/nvidia/pytorch:25.01-py3@sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-py3", "canonical": null, "submittable": false, "reason": "digest_unsupported" } },

    { "input": "https://nvcr.io/nvidia/pytorch:25.01-py3",
      "expected": { "kind": "canonical", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "scheme_in_canonical" } },

    { "input": "nvcr.io/NVIDIA/pytorch:25.01-py3",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "invalid_reference" } },

    { "input": "nvcr.io//nvidia/pytorch:25.01-py3",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "invalid_reference" } },

    { "input": "nvcr.io/nvidia/pytorch/",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "invalid_reference" } },

    { "input": "nvcr.io/",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": "empty_image_name" } },

    { "input": "nvcr.io",
      "expected": { "kind": "canonical", "registryHost": null, "project": null, "imageName": "nvcr.io", "tag": null, "canonical": null, "submittable": false, "reason": "host_required" } },

    { "input": "nvcr.io/nvidia/pytorch:",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "", "canonical": null, "submittable": false, "reason": "invalid_tag" } },

    { "input": "nvcr.io/nvidia/pytorch:-25.01",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "-25.01", "canonical": null, "submittable": false, "reason": "invalid_tag" } },

    { "input": "nvcr.io/nvidia/pytorch:25.01-",
      "expected": { "kind": "canonical", "registryHost": "nvcr.io", "project": "nvidia", "imageName": "pytorch", "tag": "25.01-", "canonical": null, "submittable": false, "reason": "invalid_tag" } },

    { "input": "   ",
      "expected": { "kind": "blank", "registryHost": null, "project": null, "imageName": null, "tag": null, "canonical": null, "submittable": false, "reason": null } }
  ]
}
```

---

## 11. Evidence index

### curl probes (2026-09-14)

`curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' --max-redirs 0 <url>`
— every row in §3.2, §3.5 and §3.6 is a verbatim result of that command.

Page HTML fetched with plain `curl -s <url>`; the copy-widget markup in §4 is
verbatim from `https://catalog.ngc.nvidia.com/orgs/nvidia/-/containers/pytorch/-`.

### nvcr.io registry API

```
curl -s 'https://nvcr.io/proxy_auth?scope=repository:<repo>:pull'      -> {"token": …}
curl -s -H 'Authorization: Bearer <token>' \
     -H 'Accept: application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.v2+json' \
     'https://nvcr.io/v2/<repo>/manifests/<tag>'
curl -s -H 'Authorization: Bearer <token>' 'https://nvcr.io/v2/<repo>/tags/list'
```

Results in §4. Also `curl -s 'https://api.ngc.nvidia.com/v2/repos/nvidia/clara/monai-toolkit'`
→ `"namespace":"nvidia/clara","name":"monai-toolkit"`.

Docker Hub cross-check: `library/python:3.12` manifest → 200 via
`https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/python:pull`
then `https://registry-1.docker.io/v2/library/python/manifests/3.12`.

### `lablup/backend.ai` (read-only)

| Claim | Location |
|---|---|
| `default_registry = "index.docker.io"`, `default_repository = "lablup"` | `src/ai/backend/common/docker.py:72-73` |
| `rx_slug` tag regex | `src/ai/backend/common/docker.py:78`, enforced `:574` |
| `parse_image_str`, incl. the `://` rejection and `divide_parts` | `src/ai/backend/common/docker.py:524-581` |
| `parse_image_tag`, `latest` default, `lablup/` insertion, no digest handling | `src/ai/backend/common/docker.py:502-522` |
| "`ParsedImageStr` can not distinguish the project and the image name" | `src/ai/backend/common/docker.py:541-542` |
| `from_image_str` — project is an input; `startswith(project + "/")` | `src/ai/backend/common/docker.py:467-500` (check at `:488-491`) |
| `ImageRef.canonical` = `join_non_empty(registry, project, name) + ":" + tag` | `src/ai/backend/common/docker.py:656-660` |
| `is_ip_address_format` | `src/ai/backend/common/utils.py:556-561` |
| `join_non_empty` drops falsy parts | `src/ai/backend/common/utils.py:564-569` |
| Registry key = `join_non_empty(registry_name, project, "/")` | `src/ai/backend/manager/repositories/image/db_source/db_source.py:533-554` |
| `_filter_by_img_canonical` — `canonical.startswith(key + "/")` | `src/ai/backend/manager/repositories/image/db_source/db_source.py:591-599` |
| Multiple matches ⇒ `RuntimeError`; no match ⇒ "It is an unknown registry." | `src/ai/backend/manager/repositories/image/db_source/db_source.py:497-511` |
| `scan_single_image` strips only the host, keeps the project in the ref | `src/ai/backend/manager/repositories/image/db_source/db_source.py:517-531` |
| `ContainerRegistryRow.project` nullable | `src/ai/backend/manager/models/container_registry/row.py:132-134` |
| Harbor project regex forbids `/` | `src/ai/backend/manager/models/container_registry/row.py:87-95` |
| `images` unique key `(registry, project, name, tag, architecture)` | `src/ai/backend/manager/models/image/row.py:157-160` |
| `POST /admin/images/rescan`, superadmin-gated | `src/ai/backend/manager/api/rest/image/registry.py:16-26` |
| Handler → `ScanImageAction(canonical, architecture)` | `src/ai/backend/manager/api/rest/image/handler.py:88-102` |
| Request body is `{canonical, architecture}` only | `src/ai/backend/common/dto/manager/image/request.py:61-65` |
| `RescanImages` GraphQL mutation takes only `registry` + `project` | `src/ai/backend/manager/api/gql_legacy/image.py:967-976` |
| Registry-argument behaviour asserted (dot is not a host signal) | `tests/unit/common/test_docker.py:173-177`, port at `:192-198`, IP forms at `:209-238`, `lablup/` at `:135-157`, multi-segment project at `:262-269`, `:345-348` |

### Upstream reference grammar

`https://raw.githubusercontent.com/distribution/reference/main/reference.go`
(package doc grammar) and `…/normalize.go:146-176` (`splitDockerDomain`).

### WebUI side

`ContainerRegistryNode.project` is `String` (nullable) —
`data/schema.graphql:3702` (`registry_name: String!` at `:3696`); the 25.3.0
payload type repeats the pair at `data/schema.graphql:4069` / `:4075`.

---

## 12. Open points for the spec ticket

- **Ambiguous registry rows** (`registry_ambiguous`) is a new failure mode; the
  spec must say what the modal shows. Suggestion: block the line and link to the
  Registries tab.
- **Architecture.** `manifest.list.v2+json` / `oci.image.index.v1+json` responses
  above mean most NGC images are multi-arch, but a few are not
  (`nvidia/clara/monai-toolkit:1.0` returned a plain `manifest.v2+json`). The
  `x86_64` default in the Advanced field is right; whether to warn on a
  single-arch mismatch is a spec decision, not a parser one.
- **`imageName` when the project is the whole remote path.** `from_image_str`
  allows an empty name (`docker.py:485-486`). The parser should reject it
  (`empty_image_name`) — no vector asserts the permissive behaviour.

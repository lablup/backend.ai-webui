# `bai-agent query` cookbook

Ready-to-run documents. Copy one, pass it to `bai-agent query '<document>'`, add
`--var k=v` for the variables it declares. Every block here is validated against
`data/schema.graphql` by `packages/backend.ai-agent-cli/src/init/skill.test.ts`,
so a block that stops matching the SDL fails CI rather than failing at a user.

**Pagination**: each entry names the one mode it uses. Never add an argument
from another mode — see `.claude/rules/graphql-pagination.md`.

**Links**: `query` annotates every node whose type has a resource page with
`webui_path` / `webui_url` (inline on the node, and again under `data.links`).
Hand the `webui_url` — or `webui_path` if no WebUI origin is known — to the
user so they can open it themselves; never describe a click path you could
report directly.

## Sessions

### 1. My sessions, newest first — cursor mode (`first`)

```graphql
query Sessions($first: Int!, $filter: String) {
  compute_session_nodes(first: $first, filter: $filter, order: "-created_at") {
    count
    edges {
      node {
        id
        row_id
        name
        status
        status_info
        type
        created_at
        scaling_group
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

`--var first=20`. Filter by status with `--var 'filter=status == "RUNNING"'`
(the manager's filter DSL, not GraphQL). Rows carry `webui_path`
`/session?sessionDetail=<row_id>`.

### 2. One session in full

```graphql
query Session($id: GlobalIDField!) {
  compute_session_node(id: $id) {
    id
    row_id
    name
    status
    status_info
    created_at
    terminated_at
    occupied_slots
    requested_slots
    agent_ids
    vfolder_mounts
  }
}
```

`--var id=<the id from entry 1>` — the Relay global id, not `row_id`. Follow up
by giving the user `webui_path` `/session?sessionDetail=<row_id>` (or the
row's `webui_url`).

## Storage

### 3. Virtual folders — cursor mode (`first`)

```graphql
query VFolders($first: Int!) {
  vfolder_nodes(first: $first, order: "-created_at") {
    count
    edges {
      node {
        id
        row_id
        name
        host
        status
        usage_mode
        ownership_type
        max_size
        cur_size
        created_at
      }
    }
  }
}
```

`--var first=20`. Rows carry `webui_path` `/data?folder=<row_id>`.

## Serving

### 4. Model service deployments — offset mode (`limit` + `offset`)

```graphql
query Deployments($limit: Int!, $offset: Int!) {
  endpoint_list(limit: $limit, offset: $offset) {
    total_count
    items {
      endpoint_id
      name
      status
      lifecycle_stage
      url
      replicas
      resource_group
      created_at
    }
  }
}
```

`--var limit=10 --var offset=0`. `limit` and `offset` are non-null here, so
this connection has no cursor mode at all. Rows carry `webui_path`
`/deployments/<endpoint_id>`.

## Cluster

### 5. Agents — cursor mode (`first`)

```graphql
query Agents($first: Int!) {
  agent_nodes(first: $first, filter: "status == \"ALIVE\"") {
    count
    edges {
      node {
        id
        row_id
        status
        schedulable
        scaling_group
        architecture
        available_slots
        occupied_slots
        container_count
        version
      }
    }
  }
}
```

`--var first=20`. Agents have no detail page yet, so no `webui_path` — point
the user at the list page instead: `/admin/agent?tab=agents`.

### 6. Resource groups (scaling groups)

```graphql
query ResourceGroups {
  scaling_groups(is_active: true) {
    name
    description
    is_active
    is_public
    scheduler
    driver
    use_host_network
  }
}
```

No pagination arguments at all; the manager returns the whole list. "Resource
Group" is the UI term — `scaling_group` is the schema's.

### 7. Resource presets

```graphql
query ResourcePresets($filter: String) {
  resource_presets(filter: $filter, order: "name") {
    id
    name
    resource_slots
    shared_memory
    scaling_group_name
  }
}
```

A plain list, no pagination. `--var 'filter=name == "gpu-small"'` narrows it.

## Accounts

### 8. Users — cursor mode (`first`)

```graphql
query Users($first: Int!) {
  user_nodes(first: $first, order: "email") {
    count
    edges {
      node {
        id
        username
        email
        full_name
        status
        role
        domain_name
        created_at
      }
    }
  }
}
```

`--var first=20`. `status` is one of `active`, `inactive`, `deleted`,
`before-verification` — `bai-agent explain UserNode.status` for the meanings.

### 9. Projects — offset mode on a `*V2` connection (`limit` + `offset`)

```graphql
query Projects($limit: Int!, $offset: Int!) {
  adminProjectsV2(limit: $limit, offset: $offset) {
    count
    edges {
      node {
        id
        basicInfo {
          name
          description
          type
        }
        organization {
          domainName
        }
        lifecycle {
          isActive
          createdAt
        }
      }
    }
  }
}
```

`--var limit=10 --var offset=0`. **This is the connection family that enforces
the pagination rule at runtime**: adding `first` or `after` here is rejected by
the manager with "Only one pagination mode allowed", and the local SDL will not
catch it — the arguments all exist.

## Mutations

### 10. Create a VFolder — allow-listed, needs `--allow-mutation`

```graphql
mutation CreateFolder($input: CreateVFolderV2Input!) {
  createVfolderV2(input: $input) {
    vfolder {
      id
      host
      status
      metadata {
        name
      }
    }
  }
}
```

Save the document above as `cookbook-10.graphql` first, then run it through the
root proxy from the repository root:

```bash
pnpm run bai-agent query --allow-mutation --json \
  --var 'input={"name":"demo","usageMode":"general","permission":"rw","cloneable":false}' \
  "$(cat cookbook-10.graphql)"
```

`createVfolderV2` is one of the three names on
`packages/backend.ai-agent-cli/src/mutation-allowlist.ts`. The result's
`data.links` entry is annotated with a `webui_path` / `webui_url` built from
`vfolder.id`, which is a base64 Relay global id — the Data page wants the raw
UUID, so that link does **not** open the folder until the id is decoded. Known
limitation; see "Known limitation" in `packages/backend.ai-agent-cli/README.md`.

### 11. Delete a VFolder — refused on purpose

```graphql
mutation DeleteFolder($vfolderId: UUID!) {
  deleteVfolderV2(vfolderId: $vfolderId) {
    id
  }
}
```

This document is valid GraphQL and valid against the SDL, and it still never
runs: the gate refuses it **before any network call**, whether or not you pass
`--allow-mutation`. Only the message differs. Without the flag:

```
error: Mutation "deleteVfolderV2" needs --allow-mutation.
code:  mutation_refused
hint:  /data
```

With `--allow-mutation`, because `deleteVfolderV2` is not on the allow-list:

```
error: Mutation "deleteVfolderV2" is not on the allow-list.
code:  mutation_refused
hint:  /data
```

Exit 4 either way. Give the person the `hint` page and let them delete it from
the Data page — do not look for another route to the same effect.

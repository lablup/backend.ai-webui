# `bai-agent query` cookbook

Ready-to-run documents. Copy one, pass it to `bai-agent query '<document>'`, add
`--var k=v` for the variables it declares. Every block here is validated against
`data/schema.graphql` by `packages/backend.ai-agent-cli/src/init/skill.test.ts`,
so a block that stops matching the SDL fails CI rather than failing at a user.

**Pagination**: each entry names the one mode it uses. Never add an argument
from another mode — see `.claude/rules/graphql-pagination.md`.

**Links**: `query` annotates every node whose type has a resource page with
`webui_path` / `webui_url`, and lists them under `data.links`. When exactly one
is produced, `data.hint` is the `bai-agent open …` that opens it.

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

`--var id=<the id from entry 1>` — the Relay global id, not `row_id`.
Follow up with `bai-agent open session <row_id>`.

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

`--var first=20`. Agents have no detail page yet, so no `webui_path` —
`bai-agent open list agent` opens the list.

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

```bash
bai-agent query --allow-mutation --json \
  --var 'input={"name":"demo","usageMode":"general","permission":"rw","cloneable":false}' \
  "$(cat cookbook-10.graphql)"
```

`createVfolderV2` is one of the three names on
`packages/backend.ai-agent-cli/src/mutation-allowlist.ts`. `data.hint` carries
the `bai-agent open vfolder <id>` that opens what you just made.

### 11. Delete a VFolder — refused on purpose

```graphql
mutation DeleteFolder($vfolderId: UUID!) {
  deleteVfolderV2(vfolderId: $vfolderId) {
    id
  }
}
```

This document is valid GraphQL and valid against the SDL, and it still never
runs: `deleteVfolderV2` is not on the allow-list, so the gate refuses it
**before any network call**, with or without `--allow-mutation`:

```
error: Mutation "deleteVfolderV2" is not on the allow-list.
code:  mutation_refused
hint:  bai-agent open list vfolder
```

Exit 4. Run the `hint` and let the person delete it from the Data page — do not
look for another route to the same effect.

---
name: relay-patterns
description: >
  GraphQL/Relay integration patterns for Backend.AI WebUI React components.
  Covers useLazyLoadQuery, useFragment, useRefetchableFragment, fragment
  architecture (query orchestrator + fragment component), naming conventions,
  modern directives (@required, @alias), client directives (@since,
  @deprecatedSince, @skipOnClient), and query optimization.
---

# Relay Patterns for Backend.AI WebUI

## Activation Triggers

- "Create a Relay query/fragment"
- "Add GraphQL data fetching"
- "Refetch pattern" or "fragment architecture"
- Working with `useLazyLoadQuery`, `useFragment`, `useRefetchableFragment`, `usePaginationFragment`
- Creating query orchestrator + fragment component pairs
- Questions about Relay naming conventions

## Quick Reference

### Commonly Used Hooks

- **`useLazyLoadQuery`** - Fetch data on component mount
- **`useFragment`** - Read fragment data from parent query
- **`useRefetchableFragment`** - Fragment with refetch capability
- **`usePaginationFragment`** - Fragment with pagination support

### Naming Conventions

- Query fragments: prop name `queryRef` (type: `ComponentQuery$key`)
- Other types: prop name `{typeName}Frgmt` (e.g., `userFrgmt: UserProfile_user$key`)

### Architecture Pattern

```
Query Orchestrator (useLazyLoadQuery, manages fetchKey/transitions)
  └── Fragment Component (useFragment, receives ref as prop, focused on presentation)
```

## Detailed Patterns

### Fragment Architecture

Separate data fetching (query orchestrator) from presentation (fragment component):

```typescript
// Query Orchestrator Component
const UserManagement: React.FC = () => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const { users } = useLazyLoadQuery<UserManagementQuery>(
    graphql`
      query UserManagementQuery {
        users {
          ...UserNodes_users
        }
      }
    `,
    {},
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  return (
    <UserNodes
      usersFrgmt={users}
      loading={isPendingRefetch}
      onRefresh={() => {
        startRefetchTransition(() => {
          updateFetchKey();
        });
      }}
    />
  );
};

// Fragment Component
interface UserNodesProps {
  usersFrgmt: UserNodes_users$key;
  loading?: boolean;
  onRefresh?: () => void;
}

const UserNodes: React.FC<UserNodesProps> = ({
  usersFrgmt,
  loading,
  onRefresh,
}) => {
  const data = useFragment(
    graphql`
      fragment UserNodes_users on Query {
        users { id, email, username, is_active }
      }
    `,
    usersFrgmt,
  );

  return <BAITable dataSource={data.users} loading={loading} />;
};
```

### Relay Hook Usage Examples

```typescript
// useLazyLoadQuery
const data = useLazyLoadQuery(
  graphql`query MyQuery { user { id ...UserProfile_user } }`,
  {},
);

// useFragment
const data = useFragment(
  graphql`fragment UserProfile_user on User { id, name, email }`,
  userRef,
);

// useRefetchableFragment
const [data, refetch] = useRefetchableFragment(
  graphql`
    fragment UserList_users on Query
    @refetchable(queryName: "UserListRefetchQuery") {
      users { id, name }
    }
  `,
  usersRef,
);
```

### Modern Relay Patterns

- **`@required` directive** - Type-safe null handling in fragments
- **`@alias` directive** - Rename fields for better semantics
- **Suspense boundaries** - Better loading state handling with concurrent features

### Fragment Colocation

- Colocate GraphQL fragments with components that use them
- Use Relay's fragment composition for nested data requirements

### Query Optimization

- Avoid over-fetching data - only request fields you need
- Use `usePaginationFragment` for lists
- Consider `@defer` and `@stream` for progressive loading

### Client Directives

Backend.AI uses custom client-side directives to handle multi-version backend compatibility. These directives are defined in `data/client-directives.graphql` and processed at runtime by `react/src/helper/graphql-transformer.ts` before queries are sent to the server.

#### Directive Reference

| Directive | Purpose | When field is removed |
|---|---|---|
| `@since(version: "X.Y.Z")` | Field introduced in version X.Y.Z | Backend version < X.Y.Z |
| `@deprecatedSince(version: "X.Y.Z")` | Field removed/replaced in version X.Y.Z | Backend version >= X.Y.Z |
| `@sinceMultiple(versions: [...])` | Multi-branch version support | Backend incompatible with version array |
| `@deprecatedSinceMultiple(versions: [...])` | Multi-branch deprecation | Backend compatible with version array |
| `@skipOnClient(if: $var)` | Conditionally skip field at runtime | Variable evaluates to `true` |

#### Usage Patterns

```graphql
# Field added in a specific version
query SessionDetailQuery {
  compute_session {
    name
    image
    permissions @since(version: "24.09.0")
    replicas @since(version: "24.12.0")
  }
}

# Field replaced in a newer version
fragment ImageInfo_image on ImageNode {
  name @deprecatedSince(version: "24.12.0")
  namespace @since(version: "24.12.0")
}

# Conditional field based on runtime feature flag
query UserSettingsQuery($isNotSupportTotp: Boolean!) {
  user {
    email
    totp_activated @skipOnClient(if: $isNotSupportTotp)
  }
}
```

#### How It Works

1. Directives are defined in `data/client-directives.graphql` and merged into the Relay schema via `relay-base.config.js`
2. At runtime, `manipulateGraphQLQueryWithClientDirectives()` in `react/src/helper/graphql-transformer.ts` strips incompatible fields before sending the query
3. The transformer also cleans up orphaned fragments and unused variables after field removal
4. Version comparison uses `backendaiclient.isManagerVersionCompatibleWith()` (PEP 440 semver)

#### Guidelines

- Always add `@since` when using fields introduced in newer backend versions
- Use `@deprecatedSince` + `@since` together when a field is replaced (old and new coexist)
- Prefer `@skipOnClient` over complex runtime conditionals for feature-flagged fields
- `@sinceMultiple` / `@deprecatedSinceMultiple` are for fields backported across version branches (rare)

### Code Review Checklist

- [ ] Query orchestrator components separate from fragment components
- [ ] Fragment refs properly typed with generated `$key` types
- [ ] Fragment props follow naming conventions (`queryRef` / `{typeName}Frgmt`)
- [ ] `@required` directive used for non-null fields
- [ ] Fragments colocated with components that use them
- [ ] `@since` / `@deprecatedSince` used for version-dependent fields
- [ ] `@skipOnClient` used for feature-flagged fields instead of runtime conditionals

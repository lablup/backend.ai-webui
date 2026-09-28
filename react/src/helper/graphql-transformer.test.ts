/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  fillStrippedFields,
  manipulateGraphQLQueryWithClientDirectives,
  transformGraphQLQueryWithClientDirectives,
} from './graphql-transformer';

describe('graphql-transformer', () => {
  it('should transform the GraphQL query correctly', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query MyQuery ($yesSkip:Boolean!, $noSkip:Boolean!, $otherNotUsed:String, $oldVersion:String) {
      testQuery  (
        props: {
          name: "asdf",
          age: 32 
        }
      ){
        field10 @skipOnClient(if: $yesSkip)
        filed11 @skipOnClient(if: $noSkip)
        
        field20 @since(version: "99") @required(ACTION:NONE)
        filed21 @since(version: "99")
        field22 @since(version: "100")
        
        field30 @deprecatedSince(version: "99")
        field31 @deprecatedSince(version: "101")
        
        fieldWithSelectionSet @since(version: "99") { 
          insideSelectionSet {
            newField @since(version: "101")
            oldField @since(version: "99")
          }
          insideSelectionSet1{
            newField @since(version: "101")
            newField2 @since(version: "101")
          }
          insideSelectionSet2 @since(version: "101"){
            whatever
          }
          
        }
        
      }
      oldQuery (name:"test") @deprecatedSince(version: "99") {
        my vlalue
      }
    }
  `,
      {
        yesSkip: true,
        noSkip: false,
        oldVersion: '99',
      },
      (version) => {
        if (Array.isArray(version)) {
          return false;
        } else {
          return 100 <= parseInt(version);
        }
      },
    );
    expect(result).toBe(`query MyQuery {
  testQuery(props: {name: "asdf", age: 32}) {
    filed11
    field20 @required(ACTION: NONE)
    filed21
    field31
    fieldWithSelectionSet {
      insideSelectionSet {
        oldField
      }
    }
  }
}`);
  });

  it('@sinceMultiple(@versions:) should transform the GraphQL query correctly', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query MyQuery ($versions1:[String!]!, $versions2:[String!]!) {
      testQuery  (
        props: {
          name: "asdf",
          age: 32 
        }
      ){
        field20 @sinceMultiple(versions: $versions1) @required(ACTION:NONE)
        filed21 @sinceMultiple(versions: $versions2)
        filed30 @sinceMultiple(versions: ["23.09.123", "24.03.124"])
        field31 @since(version: "101")
      }
      oldQuery (name:"test") @sinceMultiple(versions: $versions2) {
        myValue
      }
    }`,
      {
        versions1: ['23.09.9'],
        versions2: ['23.09.9', '24.03.1'],
      },
      (version) => {
        if (Array.isArray(version)) {
          return true;
        } else {
          return false;
        }
      },
    );
    expect(result).toBe(`query MyQuery {
  testQuery(props: {name: "asdf", age: 32}) {
    field31
  }
}`);
  });

  it('@deprecatedSinceMultiple(@versions:) should transform the GraphQL query correctly', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query MyQuery ($versions1:[String!]!, $versions2:[String!]!) {
      testQuery  (
        props: {
          name: "asdf",
          age: 32 
        }
      ){
        deprecatedField1 @deprecatedSince(version: "99")
        deprecatedField2 @deprecatedSinceMultiple(versions: $versions1)
        deprecatedField3 @deprecatedSinceMultiple(versions: $versions2)
      }
      
    }
  `,
      {
        versions1: ['23.09.9'],
        versions2: ['23.09.9', '24.03.1'],
      },
      (version) => {
        if (Array.isArray(version)) {
          return version.length === 2;
        } else {
          return false;
        }
      },
    );
    expect(result).toBe(
      'query MyQuery {\n  testQuery(props: {name: "asdf", age: 32}) {\n    deprecatedField3\n  }\n}',
    );
  });

  it('should preserve necessary fragments after field filtering', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query SessionDetailDrawerQuery(
      $id: GlobalIDField!
      $project_id: UUID!
    ) {
      compute_session_node(id: $id, project_id: $project_id) {
        ...SessionDetailContentFragment
        id
      }
    }

    fragment SessionDetailContentFragment on ComputeSessionNode {
      id
      row_id
      name
      vfolder_nodes @since(version: "2504") {
        edges {
          node {
            ...FolderLink_vfolderNode
            id
          }
        }
        count
      }
      idle_checks @since(version: "2403")
      kernel_nodes {
        edges {
          node {
            image {
              ...ImageNodeSimpleTagFragment 
              id
            }
            ...ConnectedKernelListFragment
            id
          }
        }
      }
      ...SessionActionButtonsFragment
      ...ContainerLogModalFragment
    }

    fragment FolderLink_vfolderNode on VirtualFolderNode {
      row_id
      name
    }

    fragment ImageNodeSimpleTagFragment on ImageNode {
      base_image_name @since(version: "2412")
      version @since(version: "2412")
      architecture
      name
      tags @since(version: "2412") {
        key
        value
      }
      registry
      namespace @since(version: "2412")
      tag
    }

    fragment ConnectedKernelListFragment on KernelNode {
      id
      row_id
      cluster_role
      status
      status_info
      agent_id
      container_id
    }

    fragment SessionActionButtonsFragment on ComputeSessionNode {
      id
      row_id
      type
      status
      access_key
      service_ports
      ...ContainerLogModalFragment
    }

    fragment ContainerLogModalFragment on ComputeSessionNode {
      id
      row_id
      name
      status
      access_key
      kernel_nodes {
        edges {
          node {
            id
            row_id
            container_id
            cluster_idx
            cluster_role
          }
        }
      }
    }
  `,
      {},
      (version) => {
        // Simulate version 24.03.0 - some @since fields should be removed
        return version < '2412';
      },
    );

    // Verify that necessary fragments are preserved even when some fields are removed
    expect(result).toContain('fragment FolderLink_vfolderNode');
    expect(result).toContain('fragment ImageNodeSimpleTagFragment');
    expect(result).toContain('fragment ConnectedKernelListFragment');
    expect(result).toContain('fragment SessionActionButtonsFragment');
    expect(result).toContain('fragment ContainerLogModalFragment');
    expect(result).toContain('fragment SessionDetailContentFragment');

    // Verify that fields with @since directives were properly handled
    expect(result).not.toContain('@since');
    expect(result).not.toMatch(/idle_checks/); // idle_checks field should be removed
    expect(result).toMatch(/vfolder_nodes\s*{/); // vfolder_nodes field should remain but without @since
  });

  it('should remove fragments that are truly unused after transformation', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query TestQuery {
      node {
        ...UsedFragment
        field @since(version: "99.0.0") {
          ...UnusedFragment
        }
      }
    }

    fragment UsedFragment on Node {
      id
      name
    }

    fragment UnusedFragment on Node {
      description
      metadata
    }
  `,
      {},
      (version) => {
        // Remove field that uses UnusedFragment
        return version >= '50.0.0';
      },
    );

    // UsedFragment should be preserved
    expect(result).toContain('fragment UsedFragment');
    // UnusedFragment should be removed because the field using it was removed
    expect(result).not.toContain('fragment UnusedFragment');
  });

  it('should handle empty fragments when all fields are removed by client directives', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query DashboardPageQuery($isSuperAdmin: Boolean!) {
      ...SessionCountDashboardItemFragment
      ...AgentStatsFragment @include(if: $isSuperAdmin)
    }

    fragment SessionCountDashboardItemFragment on Query {
      myInteractive: compute_session_nodes(first: 0) {
        count
      }
    }

    fragment AgentStatsFragment on Query {
      agentStats @since(version: "25.16.0") {
        totalResource {
          free
          used
        }
      }
    }
  `,
      { isSuperAdmin: true },
      (version) => {
        // Simulate version 25.15.0 - agentStats field should be removed
        return version >= '25.16.0';
      },
    );

    // Expected: AgentStatsFragment is completely removed (both definition and spread)
    // because all its fields were removed by @since directive
    expect(result).toBe(`query DashboardPageQuery {
  ...SessionCountDashboardItemFragment
}

fragment SessionCountDashboardItemFragment on Query {
  myInteractive: compute_session_nodes(first: 0) {
    count
  }
}`);
  });

  it('should handle multiple empty fragments with different directives', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query TestQuery {
      node {
        ...FragmentWithOldFields
        ...FragmentWithNewFields
        ...FragmentWithMixedFields
      }
    }

    fragment FragmentWithOldFields on Node {
      oldField1 @deprecatedSince(version: "24.0.0")
      oldField2 @deprecatedSince(version: "24.0.0")
    }

    fragment FragmentWithNewFields on Node {
      newField1 @since(version: "26.0.0")
      newField2 @since(version: "26.0.0")
    }

    fragment FragmentWithMixedFields on Node {
      id
      newField @since(version: "26.0.0")
      oldField @deprecatedSince(version: "24.0.0")
    }
  `,
      {},
      (version) => {
        // Simulate version 25.0.0.
        // Predicate returns true when the current system version is NOT compatible with the required version,
        // meaning the field should be removed.
        // - Old fields (< 24.0.0) should remain (predicate returns false, so field is kept)
        // - New fields (>= 26.0.0) should be removed (predicate returns true, so field is removed)
        return version >= '26.0.0';
      },
    );

    // Expected: FragmentWithOldFields and FragmentWithNewFields are completely removed
    // because all their fields were removed. FragmentWithMixedFields remains with only 'id'.
    expect(result).toBe(`query TestQuery {
  node {
    ...FragmentWithMixedFields
  }
}

fragment FragmentWithMixedFields on Node {
  id
}`);
  });

  it('should handle nested fragments with empty parent fragments', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query TestQuery {
      other
      node {
        ...ParentFragment
      }
    }

    fragment ParentFragment on Node {
      newField @since(version: "99.0.0") {
        ...ChildFragment
      }
    }

    fragment ChildFragment on Node {
      id
      name
    }
  `,
      {},
      (version) => {
        // Remove the newField which uses ChildFragment
        return version >= '99.0.0';
      },
    );

    // Expected: ParentFragment becomes empty and is removed along with ChildFragment.
    // The 'node' field also gets removed because it has no selection set after fragment removal.
    expect(result).toBe(`query TestQuery {
  other
}`);
  });

  it('should remove empty fragment B when only referenced by unused fragment A', () => {
    // Exact scenario from the problem description:
    // Fragment A (unused) references Fragment B (becomes empty after directive removal)
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query MyQuery {
      field1
      ...A
    }

    fragment A on Type {
      ...B
    }

    fragment B on Type {
      fieldWithClientDirective @skipOnClient(if: true)
    }
  `,
      {},
      () => {
        return false; // Not relevant for skipOnClient
      },
    );

    // Expected: Both fragments should be removed
    // - Fragment A is not used in the query
    // - Fragment B becomes empty after fieldWithClientDirective is removed
    // This test ensures that fragment B is properly removed even when it is only referenced by unused fragment A,
    // and that both fragments are removed when B becomes empty after directive removal.
    expect(result).toBe(`query MyQuery {
  field1
}`);
  });

  it('keeps one side of a version-gated field pair per manager version', () => {
    // A 26.9 manager answers a role's one scope as `scopeType`/`scopeId`;
    // older managers answer a `scopes` connection (FR-3905).
    const query = `
      fragment RoleFragment on Role {
        scopes(first: 1) @deprecatedSince(version: "26.9.0") {
          edges { node { scopeType } }
        }
        scopeType @since(version: "26.9.0")
        scopeId @since(version: "26.9.0")
      }
      query RoleQuery { adminRoles { edges { node { ...RoleFragment } } } }
    `;
    const on = (managerVersion: string) =>
      manipulateGraphQLQueryWithClientDirectives(query, {}, (version) =>
        Array.isArray(version) ? false : managerVersion < version,
      );

    const onNew = on('26.9.0');
    expect(onNew).not.toContain('scopes(');
    expect(onNew.match(/scopeType/g)).toHaveLength(1);
    expect(onNew).toContain('scopeId');

    // The one `scopeType` left is the legacy connection's own.
    const onOld = on('26.8.3');
    expect(onOld).toContain('scopes(first: 1)');
    expect(onOld.match(/scopeType/g)).toHaveLength(1);
    expect(onOld).not.toContain('scopeId');
  });
});

describe('stripped field null paths', () => {
  // `@since(version: "new")` is stripped, `@since(version: "old")` is kept
  const onOldManager = (version: string | Array<string>) =>
    Array.isArray(version) ? version.includes('new') : version === 'new';
  const nullPathsOf = (query: string, variables = {}) =>
    transformGraphQLQueryWithClientDirectives(query, variables, onOldManager)
      .nullPaths;

  it('records nested fields by response key, honouring aliases', () => {
    expect(
      nullPathsOf(`
        query Q {
          list: sessions {
            edges { node { id renamed: newField @since(version: "new") kept @since(version: "old") } }
          }
          newRoot @since(version: "new") { id }
        }
      `),
    ).toEqual([
      ['list', 'edges', 'node', 'renamed'],
      ['newRoot'],
      ['newRoot', 'id'],
    ]);
  });

  it('records the subtree of a stripped field, through its spreads, for a parent kept by another selection', () => {
    const { query, nullPaths } = transformGraphQLQueryWithClientDirectives(
      `
        query Q { rev { image { id } ...Detail } }
        fragment Detail on Rev { image @since(version: "new") { id ...Tags } }
        fragment Tags on Image { metadata { tags } }
      `,
      {},
      onOldManager,
    );
    expect(query).toBe(`query Q {
  rev {
    image {
      id
    }
  }
}`);
    expect(nullPaths).toEqual([
      ['rev', 'image'],
      ['rev', 'image', 'id'],
      ['rev', 'image', 'metadata'],
      ['rev', 'image', 'metadata', 'tags'],
    ]);

    const data = { rev: { image: { id: '1' } } };
    fillStrippedFields(data, nullPaths);
    expect(data).toEqual({ rev: { image: { id: '1', metadata: null } } });
  });

  it('records a parent emptied by its stripped children, next to the children', () => {
    expect(
      nullPathsOf(`
        query Q { a { b { c @since(version: "new") } d } }
      `),
    ).toEqual([
      ['a', 'b', 'c'],
      ['a', 'b'],
    ]);
  });

  it('maps fragment fields through every spread, including nested spreads', () => {
    expect(
      nullPathsOf(`
        query Q {
          first { ...Outer }
          second: other { nested { ...Inner } }
        }
        fragment Outer on T { id deep { ...Inner } }
        fragment Inner on T { id x @since(version: "new") }
      `),
    ).toEqual([
      ['first', 'deep', 'x'],
      ['second', 'nested', 'x'],
    ]);
  });

  it('maps a fragment that is emptied and dropped, and the field it empties', () => {
    const { query, nullPaths } = transformGraphQLQueryWithClientDirectives(
      `
        query Q { a { id b { ...OnlyNew } } }
        fragment OnlyNew on T { x @since(version: "new") y @since(version: "new") }
      `,
      {},
      onOldManager,
    );
    expect(query).toBe(`query Q {
  a {
    id
  }
}`);
    expect(nullPaths).toEqual([
      ['a', 'b'],
      ['a', 'b', 'x'],
      ['a', 'b', 'y'],
    ]);
  });

  it('drops an inline fragment emptied by stripping, and keeps its fields in the paths', () => {
    const { query, nullPaths } = transformGraphQLQueryWithClientDirectives(
      `
        query Q {
          node {
            __typename
            ... on A { a @since(version: "new") }
            ... on B { b }
          }
          onlyInline { ... on A { a @since(version: "new") } }
        }
      `,
      {},
      onOldManager,
    );
    expect(query).toBe(`query Q {
  node {
    __typename
    ... on B {
      b
    }
  }
}`);
    expect(nullPaths).toEqual([
      ['node', 'a'],
      ['onlyInline', 'a'],
      ['onlyInline'],
    ]);
  });

  it('covers every client directive, including variable-driven ones', () => {
    expect(
      nullPathsOf(
        `
        query Q($skip: Boolean!, $versions: [String!]!) {
          r {
            s @skipOnClient(if: $skip)
            m @sinceMultiple(versions: $versions)
            d @deprecatedSince(version: "old")
            dm @deprecatedSinceMultiple(versions: ["old"])
            kept
          }
        }
      `,
        { skip: true, versions: ['new'] },
      ),
    ).toEqual([
      ['r', 's'],
      ['r', 'm'],
      ['r', 'd'],
      ['r', 'dm'],
    ]);
  });

  it('returns no paths when nothing is stripped', () => {
    expect(
      nullPathsOf(
        `query Q { a { b @since(version: "old") ...F } } fragment F on T { c }`,
      ),
    ).toEqual([]);
  });
});

describe('fillStrippedFields', () => {
  it('fills absent keys with null through objects and (nested) lists', () => {
    const data = {
      list: {
        edges: [{ node: { id: '1' } }, { node: { id: '2' } }, { node: null }],
      },
      matrix: [[{ id: 'a' }], [{ id: 'b' }]],
    };
    fillStrippedFields(data, [
      ['list', 'edges', 'node', 'x'],
      ['matrix', 'y'],
      ['newRoot'],
    ]);
    expect(data).toEqual({
      list: {
        edges: [
          { node: { id: '1', x: null } },
          { node: { id: '2', x: null } },
          { node: null },
        ],
      },
      matrix: [[{ id: 'a', y: null }], [{ id: 'b', y: null }]],
      newRoot: null,
    });
  });

  it('never overwrites a returned value and stops at a null or absent parent', () => {
    const data: Record<string, unknown> = {
      a: { x: 0, y: false },
      b: null,
    };
    fillStrippedFields(data, [
      ['a', 'x'],
      ['a', 'y'],
      ['b', 'x'],
      ['c', 'x'],
    ]);
    expect(data).toEqual({ a: { x: 0, y: false }, b: null });
  });

  it('tolerates a response without data', () => {
    expect(() => fillStrippedFields(undefined, [['a']])).not.toThrow();
    expect(() => fillStrippedFields(null, [['a']])).not.toThrow();
  });
});

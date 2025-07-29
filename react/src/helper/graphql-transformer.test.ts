import { manipulateGraphQLQueryWithClientDirectives } from './graphql-transformer';

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
});

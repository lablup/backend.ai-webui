/**
 * @generated SignedSource<<9d4266abe175a800eee9571665bcf6fe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIProjectTableStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIProjectTableStoriesQuery$data = {
  readonly group_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIProjectTableFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type BAIProjectTableStoriesQuery = {
  response: BAIProjectTableStoriesQuery$data;
  variables: BAIProjectTableStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "PredefinedAtomicPermission",
  "kind": "LinkedField",
  "name": "vfolder_host_permissions",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "vfolder_host_permission_list",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectTableStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "GroupConnection",
        "kind": "LinkedField",
        "name": "group_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "GroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "GroupNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIProjectTableFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": "group_nodes(first:100,offset:0)"
      },
      (v2/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIProjectTableStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "GroupConnection",
        "kind": "LinkedField",
        "name": "group_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "GroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "GroupNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "row_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "domain_name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "is_active",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "created_at",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "total_resource_slots",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "integration_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "resource_policy",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "container_registry",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "scaling_groups",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "allowed_vfolder_hosts",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": "group_nodes(first:100,offset:0)"
      },
      (v2/*: any*/)
    ]
  },
  "params": {
    "cacheID": "2a346b4252414aa9bc56e7932e91412a",
    "id": null,
    "metadata": {},
    "name": "BAIProjectTableStoriesQuery",
    "operationKind": "query",
    "text": "query BAIProjectTableStoriesQuery {\n  group_nodes(offset: 0, first: 100) {\n    edges {\n      node {\n        ...BAIProjectTableFragment\n        id\n      }\n    }\n    count\n  }\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n}\n\nfragment BAIAllowedVfolderHostsWithPermissionFromGroupFragment on GroupNode {\n  allowed_vfolder_hosts\n}\n\nfragment BAIProjectTableFragment on GroupNode {\n  id\n  row_id\n  name\n  domain_name\n  description\n  is_active\n  created_at\n  total_resource_slots\n  integration_id\n  resource_policy\n  type\n  container_registry\n  scaling_groups\n  ...BAIAllowedVfolderHostsWithPermissionFromGroupFragment\n}\n"
  }
};
})();

(node as any).hash = "0d996a12ae6fdc493055cb5e843a105c";

export default node;

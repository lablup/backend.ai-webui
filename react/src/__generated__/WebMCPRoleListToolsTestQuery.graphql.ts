/**
 * @generated SignedSource<<d760ef36bad2b6c1eb52a38f2095969a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPRoleListToolsTestQuery$variables = Record<PropertyKey, never>;
export type WebMCPRoleListToolsTestQuery$data = {
  readonly adminRoles: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"WebMCPRoleListToolsFragment">;
      };
    }>;
  } | null | undefined;
};
export type WebMCPRoleListToolsTestQuery = {
  response: WebMCPRoleListToolsTestQuery$data;
  variables: WebMCPRoleListToolsTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v1 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v2 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UUID"
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "WebMCPRoleListToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "RoleConnection",
        "kind": "LinkedField",
        "name": "adminRoles",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RoleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Role",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "WebMCPRoleListToolsFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminRoles(first:10)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "WebMCPRoleListToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "RoleConnection",
        "kind": "LinkedField",
        "name": "adminRoles",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RoleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Role",
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
                    "name": "entityId",
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
                    "name": "description",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "source",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "autoAssign",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "updatedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "scopeType",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "scopeId",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminRoles(first:10)"
      }
    ]
  },
  "params": {
    "cacheID": "04fc3e92307d48ab8a521e8f55d373fa",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "adminRoles": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "RoleConnection"
        },
        "adminRoles.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "RoleEdge"
        },
        "adminRoles.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Role"
        },
        "adminRoles.edges.node.autoAssign": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "adminRoles.edges.node.createdAt": (v1/*: any*/),
        "adminRoles.edges.node.description": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "adminRoles.edges.node.entityId": (v2/*: any*/),
        "adminRoles.edges.node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "adminRoles.edges.node.name": (v3/*: any*/),
        "adminRoles.edges.node.scopeId": (v2/*: any*/),
        "adminRoles.edges.node.scopeType": (v3/*: any*/),
        "adminRoles.edges.node.source": {
          "enumValues": [
            "SYSTEM",
            "CUSTOM"
          ],
          "nullable": false,
          "plural": false,
          "type": "RoleSource"
        },
        "adminRoles.edges.node.status": {
          "enumValues": [
            "ACTIVE",
            "INACTIVE",
            "DELETED"
          ],
          "nullable": false,
          "plural": false,
          "type": "RoleStatus"
        },
        "adminRoles.edges.node.updatedAt": (v1/*: any*/)
      }
    },
    "name": "WebMCPRoleListToolsTestQuery",
    "operationKind": "query",
    "text": "query WebMCPRoleListToolsTestQuery {\n  adminRoles(first: 10) {\n    edges {\n      node {\n        ...WebMCPRoleListToolsFragment\n        id\n      }\n    }\n  }\n}\n\nfragment WebMCPRoleListToolsFragment on Role {\n  id\n  entityId\n  name\n  description\n  source\n  status\n  autoAssign\n  createdAt\n  updatedAt\n  scopeType\n  scopeId\n}\n"
  }
};
})();

(node as any).hash = "40a12471beef10bab136212657b6666a";

export default node;

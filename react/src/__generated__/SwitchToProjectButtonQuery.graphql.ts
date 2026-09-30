/**
 * @generated SignedSource<<53f56048daadf4925a1f276b234c88bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SwitchToProjectButtonQuery$variables = {
  legacyProjectId: string;
  projectId: string;
  supportsProjectV2: boolean;
};
export type SwitchToProjectButtonQuery$data = {
  readonly group_node?: {
    readonly name: string | null | undefined;
  } | null | undefined;
  readonly projectV2?: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
};
export type SwitchToProjectButtonQuery = {
  response: SwitchToProjectButtonQuery$data;
  variables: SwitchToProjectButtonQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "legacyProjectId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsProjectV2"
},
v3 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = [
  (v4/*: any*/)
],
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "legacyProjectId"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SwitchToProjectButtonQuery",
    "selections": [
      {
        "condition": "supportsProjectV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "supportsProjectV2",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v7/*: any*/),
            "concreteType": "GroupNode",
            "kind": "LinkedField",
            "name": "group_node",
            "plural": false,
            "selections": (v5/*: any*/),
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "SwitchToProjectButtonQuery",
    "selections": [
      {
        "condition": "supportsProjectV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              (v8/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "supportsProjectV2",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v7/*: any*/),
            "concreteType": "GroupNode",
            "kind": "LinkedField",
            "name": "group_node",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v8/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "9ef8844fe4f57c3941a3b5eb175716b8",
    "id": null,
    "metadata": {},
    "name": "SwitchToProjectButtonQuery",
    "operationKind": "query",
    "text": "query SwitchToProjectButtonQuery(\n  $projectId: UUID!\n  $legacyProjectId: String!\n  $supportsProjectV2: Boolean!\n) {\n  projectV2(projectId: $projectId) @include(if: $supportsProjectV2) @since(version: \"26.2.0\") {\n    basicInfo {\n      name\n    }\n    id\n  }\n  group_node(id: $legacyProjectId) @skip(if: $supportsProjectV2) @since(version: \"24.03.0\") @deprecatedSince(version: \"26.2.0\") {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "9390a68545735d61f562ffeac50183bf";

export default node;

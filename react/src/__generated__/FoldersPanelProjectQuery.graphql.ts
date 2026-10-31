/**
 * @generated SignedSource<<95d920ab2a257ed32bb1ec1f0462888d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type FoldersPanelProjectQuery$variables = {
  policyProjectId: string;
  projectId: string;
};
export type FoldersPanelProjectQuery$data = {
  readonly policy: Result<{
    readonly maxVfolderCount: number;
  } | null | undefined, unknown>;
  readonly ready: {
    readonly count: number;
  } | null | undefined;
  readonly trash: {
    readonly count: number;
  } | null | undefined;
};
export type FoldersPanelProjectQuery = {
  response: FoldersPanelProjectQuery$data;
  variables: FoldersPanelProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "policyProjectId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v2 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v3 = {
  "kind": "Variable",
  "name": "projectId",
  "variableName": "projectId"
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v5 = {
  "alias": "ready",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "notIn": [
            "DELETE_PENDING",
            "DELETE_ONGOING",
            "DELETE_COMPLETE",
            "DELETE_ERROR"
          ]
        }
      }
    },
    (v2/*: any*/),
    (v3/*: any*/)
  ],
  "concreteType": "VFolderConnection",
  "kind": "LinkedField",
  "name": "projectVfolders",
  "plural": false,
  "selections": (v4/*: any*/),
  "storageKey": null
},
v6 = {
  "alias": "trash",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "DELETE_PENDING"
        }
      }
    },
    (v2/*: any*/),
    (v3/*: any*/)
  ],
  "concreteType": "VFolderConnection",
  "kind": "LinkedField",
  "name": "projectVfolders",
  "plural": false,
  "selections": (v4/*: any*/),
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "policyProjectId"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxVfolderCount",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FoldersPanelProjectQuery",
    "selections": [
      (v5/*: any*/),
      (v6/*: any*/),
      {
        "kind": "CatchField",
        "field": {
          "alias": "policy",
          "args": (v7/*: any*/),
          "concreteType": "ProjectResourcePolicyV2",
          "kind": "LinkedField",
          "name": "scopedProjectResourcePolicyV2",
          "plural": false,
          "selections": [
            (v8/*: any*/)
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "FoldersPanelProjectQuery",
    "selections": [
      (v5/*: any*/),
      (v6/*: any*/),
      {
        "alias": "policy",
        "args": (v7/*: any*/),
        "concreteType": "ProjectResourcePolicyV2",
        "kind": "LinkedField",
        "name": "scopedProjectResourcePolicyV2",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0cccb944b11b34e9bf27cb8218d0fbf2",
    "id": null,
    "metadata": {},
    "name": "FoldersPanelProjectQuery",
    "operationKind": "query",
    "text": "query FoldersPanelProjectQuery(\n  $projectId: UUID!\n  $policyProjectId: ID!\n) {\n  ready: projectVfolders(projectId: $projectId, filter: {status: {notIn: [DELETE_PENDING, DELETE_ONGOING, DELETE_COMPLETE, DELETE_ERROR]}}, limit: 1) {\n    count\n  }\n  trash: projectVfolders(projectId: $projectId, filter: {status: {equals: DELETE_PENDING}}, limit: 1) {\n    count\n  }\n  policy: scopedProjectResourcePolicyV2(projectId: $policyProjectId) {\n    maxVfolderCount\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "5ff9cbe5dc56fdc5fe3c984149e81a03";

export default node;

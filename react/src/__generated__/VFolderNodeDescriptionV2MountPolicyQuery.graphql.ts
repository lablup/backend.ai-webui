/**
 * @generated SignedSource<<b237cb59966f4978af03d6bad2a430e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderNodeDescriptionV2MountPolicyQuery$variables = {
  vfolderId: string;
};
export type VFolderNodeDescriptionV2MountPolicyQuery$data = {
  readonly vfolderMountPolicies: {
    readonly items: ReadonlyArray<{
      readonly permission: VFolderMountPermission;
      readonly userId: string;
    }>;
  } | null | undefined;
};
export type VFolderNodeDescriptionV2MountPolicyQuery = {
  response: VFolderNodeDescriptionV2MountPolicyQuery$data;
  variables: VFolderNodeDescriptionV2MountPolicyQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "vfolderId",
      "variableName": "vfolderId"
    }
  ],
  "concreteType": "VFolderMountPoliciesPayload",
  "kind": "LinkedField",
  "name": "vfolderMountPolicies",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderMountPolicy",
      "kind": "LinkedField",
      "name": "items",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "userId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "permission",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderNodeDescriptionV2MountPolicyQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v1/*: any*/),
        "to": "NULL"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderNodeDescriptionV2MountPolicyQuery",
    "selections": [
      (v1/*: any*/)
    ]
  },
  "params": {
    "cacheID": "610955be2509cc8f7b03599e7866c583",
    "id": null,
    "metadata": {},
    "name": "VFolderNodeDescriptionV2MountPolicyQuery",
    "operationKind": "query",
    "text": "query VFolderNodeDescriptionV2MountPolicyQuery(\n  $vfolderId: UUID!\n) {\n  vfolderMountPolicies(vfolderId: $vfolderId) {\n    items {\n      userId\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "caddb3c482e07b2f73824b6d1714c326";

export default node;

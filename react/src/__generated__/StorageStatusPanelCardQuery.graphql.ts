/**
 * @generated SignedSource<<410ff105ff2f34c553e147969fb2a6b1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type StorageStatusPanelCardQuery$variables = {
  name: string;
};
export type StorageStatusPanelCardQuery$data = {
  readonly project_resource_policy: {
    readonly max_vfolder_count: number | null | undefined;
  } | null | undefined;
  readonly user_resource_policy: {
    readonly max_vfolder_count: number | null | undefined;
  } | null | undefined;
};
export type StorageStatusPanelCardQuery = {
  response: StorageStatusPanelCardQuery$data;
  variables: StorageStatusPanelCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_count",
  "storageKey": null
},
v2 = [
  (v1/*: any*/)
],
v3 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  }
],
v4 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policy",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policy",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6a4458681167a38a930cf05173cf0d90",
    "id": null,
    "metadata": {},
    "name": "StorageStatusPanelCardQuery",
    "operationKind": "query",
    "text": "query StorageStatusPanelCardQuery(\n  $name: String!\n) {\n  user_resource_policy {\n    max_vfolder_count\n    id\n  }\n  project_resource_policy(name: $name) {\n    max_vfolder_count\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "33191e01e0635b3635f28c7383463c39";

export default node;

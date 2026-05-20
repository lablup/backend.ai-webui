/**
 * @generated SignedSource<<4321ed67c422fd7a7fe927ec71ad333c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MountedVFolderLinksQuery$variables = {
  uuid: string;
};
export type MountedVFolderLinksQuery$data = {
  readonly legacy_session: {
    readonly mounts: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type MountedVFolderLinksQuery = {
  response: MountedVFolderLinksQuery$data;
  variables: MountedVFolderLinksQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "uuid"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "uuid"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mounts",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MountedVFolderLinksQuery",
    "selections": [
      {
        "alias": "legacy_session",
        "args": (v1/*: any*/),
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "compute_session",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
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
    "name": "MountedVFolderLinksQuery",
    "selections": [
      {
        "alias": "legacy_session",
        "args": (v1/*: any*/),
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "compute_session",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "cacheID": "9025af1e54e75a0d3041d0e12150939c",
    "id": null,
    "metadata": {},
    "name": "MountedVFolderLinksQuery",
    "operationKind": "query",
    "text": "query MountedVFolderLinksQuery(\n  $uuid: UUID!\n) {\n  legacy_session: compute_session(id: $uuid) {\n    mounts\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "f1e2ef43ac11c6b980313ddac8cd1ec9";

export default node;

/**
 * @generated SignedSource<<a473707c26b9b877ea1ea8f6a1405d36>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImageTagsUNSAFELazySessionImageTagQuery$variables = {
  uuid: string;
};
export type ImageTagsUNSAFELazySessionImageTagQuery$data = {
  readonly compute_session: {
    readonly architecture: string | null | undefined;
    readonly image: string | null | undefined;
    readonly mounts: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type ImageTagsUNSAFELazySessionImageTagQuery = {
  response: ImageTagsUNSAFELazySessionImageTagQuery$data;
  variables: ImageTagsUNSAFELazySessionImageTagQuery$variables;
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
  "name": "image",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mounts",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ImageTagsUNSAFELazySessionImageTagQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "compute_session",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/)
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
    "name": "ImageTagsUNSAFELazySessionImageTagQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "compute_session",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
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
    "cacheID": "561670e250a47b880df70cc432c19049",
    "id": null,
    "metadata": {},
    "name": "ImageTagsUNSAFELazySessionImageTagQuery",
    "operationKind": "query",
    "text": "query ImageTagsUNSAFELazySessionImageTagQuery(\n  $uuid: UUID!\n) {\n  compute_session(id: $uuid) {\n    image\n    mounts\n    architecture\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "20cd966dac98c484e7c795ff3d7e78a4";

export default node;

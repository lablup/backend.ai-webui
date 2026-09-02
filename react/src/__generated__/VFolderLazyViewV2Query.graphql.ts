/**
 * @generated SignedSource<<2cf1e5238e3eb5a2bb7402fb09a525bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderLazyViewV2Query$variables = {
  vfolderId: string;
};
export type VFolderLazyViewV2Query$data = {
  readonly vfolderNode: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonV2Fragment">;
  } | null | undefined;
};
export type VFolderLazyViewV2Query = {
  response: VFolderLazyViewV2Query$data;
  variables: VFolderLazyViewV2Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "vfolderId",
    "variableName": "vfolderId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "VFolderMetadataInfo",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
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
    "name": "VFolderLazyViewV2Query",
    "selections": [
      {
        "alias": "vfolderNode",
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": (v2/*: any*/),
            "action": "THROW"
          },
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "VFolderNodeIdenticonV2Fragment"
          }
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
    "name": "VFolderLazyViewV2Query",
    "selections": [
      {
        "alias": "vfolderNode",
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a8e6667f8686613891b82242f776ede2",
    "id": null,
    "metadata": {},
    "name": "VFolderLazyViewV2Query",
    "operationKind": "query",
    "text": "query VFolderLazyViewV2Query(\n  $vfolderId: UUID!\n) {\n  vfolderNode: vfolderV2(vfolderId: $vfolderId) {\n    id\n    metadata {\n      name\n    }\n    ...VFolderNodeIdenticonV2Fragment\n  }\n}\n\nfragment VFolderNodeIdenticonV2Fragment on VFolder {\n  id\n}\n"
  }
};
})();

(node as any).hash = "392b524849df675f818c750f08fc22ec";

export default node;

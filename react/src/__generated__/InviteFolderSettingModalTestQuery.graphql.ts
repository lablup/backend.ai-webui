/**
 * @generated SignedSource<<1ed5ba92326d14cefa5c6865c0603928>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InviteFolderSettingModalTestQuery$variables = {
  vfolderId: string;
};
export type InviteFolderSettingModalTestQuery$data = {
  readonly vfolderV2: {
    readonly " $fragmentSpreads": FragmentRefs<"InviteFolderSettingModalFragment">;
  } | null | undefined;
};
export type InviteFolderSettingModalTestQuery = {
  response: InviteFolderSettingModalTestQuery$data;
  variables: InviteFolderSettingModalTestQuery$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InviteFolderSettingModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "InviteFolderSettingModalFragment"
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
    "name": "InviteFolderSettingModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
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
            "concreteType": "VFolderAccessControlInfo",
            "kind": "LinkedField",
            "name": "accessControl",
            "plural": false,
            "selections": [
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
      }
    ]
  },
  "params": {
    "cacheID": "7400991565e77732ec77f4fc6bc34192",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalTestQuery",
    "operationKind": "query",
    "text": "query InviteFolderSettingModalTestQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    ...InviteFolderSettingModalFragment\n    id\n  }\n}\n\nfragment InviteFolderSettingModalFragment on VFolder {\n  id\n  accessControl {\n    permission\n  }\n}\n"
  }
};
})();

(node as any).hash = "e6e958087229e3e8a96bad2218ae9794";

export default node;

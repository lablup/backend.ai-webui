/**
 * @generated SignedSource<<8834e07a19cba0d4fe8893ebf59ce7b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderAutoMountScopeType = "PROJECT" | "USER" | "%future added value";
export type CreateVFolderAutoMountInput = {
  mountDestination: string;
  mountPermission: MountPermission;
  scope: VFolderAutoMountScopeRef;
  subpath?: string;
  vfolderId: string;
};
export type VFolderAutoMountScopeRef = {
  scopeId: string;
  scopeType: VFolderAutoMountScopeType;
};
export type VFolderAutoMountSettingModalCreateMutation$variables = {
  input: CreateVFolderAutoMountInput;
};
export type VFolderAutoMountSettingModalCreateMutation$data = {
  readonly createVfolderAutoMount: {
    readonly vfolderAutoMount: {
      readonly id: string;
    };
  } | null | undefined;
};
export type VFolderAutoMountSettingModalCreateMutation = {
  response: VFolderAutoMountSettingModalCreateMutation$data;
  variables: VFolderAutoMountSettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateVFolderAutoMountPayload",
    "kind": "LinkedField",
    "name": "createVfolderAutoMount",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolderAutoMount",
        "kind": "LinkedField",
        "name": "vfolderAutoMount",
        "plural": false,
        "selections": [
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderAutoMountSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderAutoMountSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "71b85becc4c9655c62291924db30083d",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountSettingModalCreateMutation(\n  $input: CreateVFolderAutoMountInput!\n) {\n  createVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8a7578ee11d79b04b843beaf7ea51e99";

export default node;

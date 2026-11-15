/**
 * @generated SignedSource<<c08efc067ab540b084b4d9a678357081>>
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
export type FolderCreateModalAutoMountMutation$variables = {
  input: CreateVFolderAutoMountInput;
};
export type FolderCreateModalAutoMountMutation$data = {
  readonly createVfolderAutoMount: {
    readonly vfolderAutoMount: {
      readonly id: string;
    };
  } | null | undefined;
};
export type FolderCreateModalAutoMountMutation = {
  response: FolderCreateModalAutoMountMutation$data;
  variables: FolderCreateModalAutoMountMutation$variables;
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
    "name": "FolderCreateModalAutoMountMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderCreateModalAutoMountMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2394efd0d279bb1edaf16288f39c97a9",
    "id": null,
    "metadata": {},
    "name": "FolderCreateModalAutoMountMutation",
    "operationKind": "mutation",
    "text": "mutation FolderCreateModalAutoMountMutation(\n  $input: CreateVFolderAutoMountInput!\n) {\n  createVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cc3bbd18629e0ddff68f4b83b9de7cce";

export default node;

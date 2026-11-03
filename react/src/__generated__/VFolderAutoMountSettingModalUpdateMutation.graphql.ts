/**
 * @generated SignedSource<<5d68cf3d7a0f84f076d6fde864bc2130>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type UpdateVFolderAutoMountInput = {
  id: string;
  mountDestination?: string | null | undefined;
  mountPermission?: MountPermission | null | undefined;
  subpath?: string | null | undefined;
};
export type VFolderAutoMountSettingModalUpdateMutation$variables = {
  input: UpdateVFolderAutoMountInput;
};
export type VFolderAutoMountSettingModalUpdateMutation$data = {
  readonly updateVfolderAutoMount: {
    readonly vfolderAutoMount: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountSettingModalFragment">;
    };
  } | null | undefined;
};
export type VFolderAutoMountSettingModalUpdateMutation = {
  response: VFolderAutoMountSettingModalUpdateMutation$data;
  variables: VFolderAutoMountSettingModalUpdateMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderAutoMountSettingModalUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateVFolderAutoMountPayload",
        "kind": "LinkedField",
        "name": "updateVfolderAutoMount",
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
              (v2/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "VFolderAutoMountSettingModalFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderAutoMountSettingModalUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateVFolderAutoMountPayload",
        "kind": "LinkedField",
        "name": "updateVfolderAutoMount",
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "entityId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "vfolderId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mountDestination",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "subpath",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mountPermission",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolder",
                "kind": "LinkedField",
                "name": "vfolder",
                "plural": false,
                "selections": [
                  {
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
                  },
                  (v2/*: any*/)
                ],
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
    "cacheID": "3bb050d66767715aa1fd056c37adfd81",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountSettingModalUpdateMutation(\n  $input: UpdateVFolderAutoMountInput!\n) {\n  updateVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n      ...VFolderAutoMountSettingModalFragment\n    }\n  }\n}\n\nfragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {\n  entityId\n  vfolderId\n  mountDestination\n  subpath\n  mountPermission\n  vfolder {\n    metadata {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "088ecaebf37d537de98475eee0aa6f74";

export default node;

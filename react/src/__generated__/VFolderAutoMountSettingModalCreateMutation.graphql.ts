/**
 * @generated SignedSource<<9f9f1053beb82e14d5f50ea957be8c15>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
      readonly vfolder: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesV2AutoMountCellFragment">;
      } | null | undefined;
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
    "name": "VFolderAutoMountSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolder",
                "kind": "LinkedField",
                "name": "vfolder",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "VFolderNodesV2AutoMountCellFragment"
                  }
                ],
                "storageKey": null
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
    "name": "VFolderAutoMountSettingModalCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolder",
                "kind": "LinkedField",
                "name": "vfolder",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "limit",
                        "value": 1
                      }
                    ],
                    "concreteType": "VFolderAutoMountConnection",
                    "kind": "LinkedField",
                    "name": "vfolderAutoMounts",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "VFolderAutoMountEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "VFolderAutoMount",
                            "kind": "LinkedField",
                            "name": "node",
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
                                "name": "scopeType",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "scopeId",
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
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "vfolderAutoMounts(limit:1)"
                  }
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
    "cacheID": "7aebe7590733c8cde8c6cd2bc30b08bf",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountSettingModalCreateMutation(\n  $input: CreateVFolderAutoMountInput!\n) {\n  createVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n      vfolder {\n        id\n        ...VFolderNodesV2AutoMountCellFragment\n      }\n    }\n  }\n}\n\nfragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {\n  entityId\n  mountDestination\n  subpath\n  mountPermission\n}\n\nfragment VFolderNodesV2AutoMountCellFragment on VFolder {\n  vfolderAutoMounts(limit: 1) {\n    edges {\n      node {\n        id\n        entityId\n        scopeType\n        scopeId\n        mountDestination\n        subpath\n        mountPermission\n        ...VFolderAutoMountSettingModalFragment\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7f834750fb7e07a3ce36516ce0ef64f0";

export default node;

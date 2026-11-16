/**
 * @generated SignedSource<<f774921d68985baa7462b885359b4b56>>
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
      readonly vfolder: {
        readonly id: string;
        readonly vfolderAutoMounts: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly mountDestination: string;
              readonly mountPermission: MountPermission;
              readonly scopeType: VFolderAutoMountScopeType;
              readonly subpath: string;
            };
          }>;
        } | null | undefined;
      } | null | undefined;
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
},
v3 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subpath",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountPermission",
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
              },
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
                    "args": (v3/*: any*/),
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
                              (v4/*: any*/),
                              (v5/*: any*/),
                              (v6/*: any*/),
                              (v7/*: any*/)
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
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
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
                    "args": (v3/*: any*/),
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
                              (v4/*: any*/),
                              (v5/*: any*/),
                              (v6/*: any*/),
                              (v7/*: any*/),
                              (v2/*: any*/)
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
    "cacheID": "9210f44e2f974fa21d98c133fb03c47c",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountSettingModalUpdateMutation(\n  $input: UpdateVFolderAutoMountInput!\n) {\n  updateVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n      ...VFolderAutoMountSettingModalFragment\n      vfolder {\n        id\n        vfolderAutoMounts(limit: 1) {\n          edges {\n            node {\n              scopeType\n              mountDestination\n              subpath\n              mountPermission\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {\n  entityId\n  mountDestination\n  subpath\n  mountPermission\n}\n"
  }
};
})();

(node as any).hash = "7d35854b951a6fed13b94bb769f25b09";

export default node;

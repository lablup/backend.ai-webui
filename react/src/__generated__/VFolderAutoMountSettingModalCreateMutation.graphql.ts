/**
 * @generated SignedSource<<f67f7f8cf59870224d713cb1656e2513>>
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
    "cacheID": "3e16973a19efe12d6b15fac97e5951a3",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountSettingModalCreateMutation(\n  $input: CreateVFolderAutoMountInput!\n) {\n  createVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n      vfolder {\n        id\n        vfolderAutoMounts(limit: 1) {\n          edges {\n            node {\n              scopeType\n              mountDestination\n              subpath\n              mountPermission\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3e50b25d2df11790ddadcb38ce22ff2b";

export default node;

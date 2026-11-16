/**
 * @generated SignedSource<<002b5ac3989469941f1b55c25449558b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderAutoMountScopeType = "PROJECT" | "USER" | "%future added value";
export type DeleteVFolderAutoMountInput = {
  id: string;
};
export type VFolderAutoMountMetadataSectionDeleteMutation$variables = {
  input: DeleteVFolderAutoMountInput;
};
export type VFolderAutoMountMetadataSectionDeleteMutation$data = {
  readonly deleteVfolderAutoMount: {
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
export type VFolderAutoMountMetadataSectionDeleteMutation = {
  response: VFolderAutoMountMetadataSectionDeleteMutation$data;
  variables: VFolderAutoMountMetadataSectionDeleteMutation$variables;
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
    "name": "VFolderAutoMountMetadataSectionDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteVFolderAutoMountPayload",
        "kind": "LinkedField",
        "name": "deleteVfolderAutoMount",
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
    "name": "VFolderAutoMountMetadataSectionDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteVFolderAutoMountPayload",
        "kind": "LinkedField",
        "name": "deleteVfolderAutoMount",
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
    "cacheID": "090e31d140659fdee76b67cd4d1d2a0e",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountMetadataSectionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountMetadataSectionDeleteMutation(\n  $input: DeleteVFolderAutoMountInput!\n) {\n  deleteVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n      vfolder {\n        id\n        vfolderAutoMounts(limit: 1) {\n          edges {\n            node {\n              scopeType\n              mountDestination\n              subpath\n              mountPermission\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "59a4639d8f6587667f6a2d12984bdf26";

export default node;

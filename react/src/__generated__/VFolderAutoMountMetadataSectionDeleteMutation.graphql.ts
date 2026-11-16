/**
 * @generated SignedSource<<5e9b27eb5ccf578e787e46c5e97c8dd2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
        readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesV2AutoMountCellFragment">;
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
    "cacheID": "ad3d804f72353b7006ceb7732e66e81f",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountMetadataSectionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountMetadataSectionDeleteMutation(\n  $input: DeleteVFolderAutoMountInput!\n) {\n  deleteVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n      vfolder {\n        id\n        ...VFolderNodesV2AutoMountCellFragment\n      }\n    }\n  }\n}\n\nfragment VFolderNodesV2AutoMountCellFragment on VFolder {\n  vfolderAutoMounts(limit: 1) {\n    edges {\n      node {\n        scopeType\n        mountDestination\n        subpath\n        mountPermission\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "be8bee9cc2b1cf5cb66c7d47ef5d1739";

export default node;

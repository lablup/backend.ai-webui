/**
 * @generated SignedSource<<cbf6ce9749139b4b2f190e6b8c39122f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderAutoMountScope = {
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type VFolderAutoMountListQuery$variables = {
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  scope: VFolderAutoMountScope;
};
export type VFolderAutoMountListQuery$data = {
  readonly scopedVfolderAutoMounts: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly mountDestination: string;
        readonly mountPermission: MountPermission;
        readonly subpath: string;
        readonly vfolder: {
          readonly metadata: {
            readonly name: string;
          };
        } | null | undefined;
        readonly vfolderId: string;
        readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountSettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type VFolderAutoMountListQuery = {
  response: VFolderAutoMountListQuery$data;
  variables: VFolderAutoMountListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v3 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "MOUNT_DESTINATION"
      }
    ]
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subpath",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountPermission",
  "storageKey": null
},
v11 = {
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderAutoMountListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "VFolderAutoMountConnection",
        "kind": "LinkedField",
        "name": "scopedVfolderAutoMounts",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "vfolder",
                    "plural": false,
                    "selections": [
                      (v11/*: any*/)
                    ],
                    "storageKey": null
                  },
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "VFolderAutoMountListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "VFolderAutoMountConnection",
        "kind": "LinkedField",
        "name": "scopedVfolderAutoMounts",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VFolder",
                    "kind": "LinkedField",
                    "name": "vfolder",
                    "plural": false,
                    "selections": [
                      (v11/*: any*/),
                      (v5/*: any*/)
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "eb7dd881309ee1c51e300dca71665901",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountListQuery",
    "operationKind": "query",
    "text": "query VFolderAutoMountListQuery(\n  $scope: VFolderAutoMountScope!\n  $limit: Int\n  $offset: Int\n) {\n  scopedVfolderAutoMounts(scope: $scope, orderBy: [{field: MOUNT_DESTINATION, direction: ASC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        vfolderId\n        mountDestination\n        subpath\n        mountPermission\n        vfolder {\n          metadata {\n            name\n          }\n          id\n        }\n        ...VFolderAutoMountSettingModalFragment\n      }\n    }\n  }\n}\n\nfragment VFolderAutoMountSettingModalFragment on VFolderAutoMount {\n  entityId\n  vfolderId\n  mountDestination\n  subpath\n  mountPermission\n  vfolder {\n    metadata {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ba2e02553f146c844f108f93405e5b26";

export default node;

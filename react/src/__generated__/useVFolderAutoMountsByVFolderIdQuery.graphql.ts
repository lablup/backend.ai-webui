/**
 * @generated SignedSource<<a22c2f107d0ac146d1de24d1495c2e32>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderAutoMountScopeType = "PROJECT" | "USER" | "%future added value";
export type VFolderAutoMountScope = {
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type useVFolderAutoMountsByVFolderIdQuery$variables = {
  isSupported: boolean;
  limit: number;
  scope: VFolderAutoMountScope;
};
export type useVFolderAutoMountsByVFolderIdQuery$data = {
  readonly scopedVfolderAutoMounts?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly mountDestination: string;
        readonly mountPermission: MountPermission;
        readonly scopeType: VFolderAutoMountScopeType;
        readonly subpath: string;
        readonly vfolderId: string;
      };
    }>;
  } | null | undefined;
};
export type useVFolderAutoMountsByVFolderIdQuery = {
  response: useVFolderAutoMountsByVFolderIdQuery$data;
  variables: useVFolderAutoMountsByVFolderIdQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSupported"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
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
  "name": "vfolderId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subpath",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountPermission",
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
    "name": "useVFolderAutoMountsByVFolderIdQuery",
    "selections": [
      {
        "condition": "isSupported",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "VFolderAutoMountConnection",
            "kind": "LinkedField",
            "name": "scopedVfolderAutoMounts",
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
                      (v8/*: any*/)
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useVFolderAutoMountsByVFolderIdQuery",
    "selections": [
      {
        "condition": "isSupported",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v3/*: any*/),
            "concreteType": "VFolderAutoMountConnection",
            "kind": "LinkedField",
            "name": "scopedVfolderAutoMounts",
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
                      (v8/*: any*/),
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
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "f7b3457e5ef308f536c7c1f42a64b970",
    "id": null,
    "metadata": {},
    "name": "useVFolderAutoMountsByVFolderIdQuery",
    "operationKind": "query",
    "text": "query useVFolderAutoMountsByVFolderIdQuery(\n  $scope: VFolderAutoMountScope!\n  $limit: Int!\n  $isSupported: Boolean!\n) {\n  scopedVfolderAutoMounts(scope: $scope, limit: $limit, orderBy: [{field: MOUNT_DESTINATION, direction: ASC}]) @include(if: $isSupported) {\n    edges {\n      node {\n        vfolderId\n        scopeType\n        mountDestination\n        subpath\n        mountPermission\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1abb89530223cfee0875bad8fd148908";

export default node;

/**
 * @generated SignedSource<<9710fbc0728845731f35c4a67224a589>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditableVFolderNameV2TestQuery$variables = {
  vfolderId: string;
};
export type EditableVFolderNameV2TestQuery$data = {
  readonly vfolderV2: {
    readonly " $fragmentSpreads": FragmentRefs<"EditableVFolderNameV2Fragment">;
  } | null | undefined;
};
export type EditableVFolderNameV2TestQuery = {
  response: EditableVFolderNameV2TestQuery$data;
  variables: EditableVFolderNameV2TestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "vfolderId",
    "variableName": "vfolderId"
  }
],
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UUID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EditableVFolderNameV2TestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "EditableVFolderNameV2Fragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditableVFolderNameV2TestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          },
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
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderOwnershipInfo",
            "kind": "LinkedField",
            "name": "ownership",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "userId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "projectId",
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
    "cacheID": "89a2a86e6cc2336bddaca4eb2031f5f9",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "vfolderV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "VFolder"
        },
        "vfolderV2.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "vfolderV2.metadata": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderMetadataInfo"
        },
        "vfolderV2.metadata.name": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "vfolderV2.ownership": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderOwnershipInfo"
        },
        "vfolderV2.ownership.projectId": (v2/*: any*/),
        "vfolderV2.ownership.userId": (v2/*: any*/),
        "vfolderV2.status": {
          "enumValues": [
            "READY",
            "CLONING",
            "DELETE_PENDING",
            "DELETE_ONGOING",
            "DELETE_COMPLETE",
            "DELETE_ERROR"
          ],
          "nullable": false,
          "plural": false,
          "type": "VFolderOperationStatus"
        }
      }
    },
    "name": "EditableVFolderNameV2TestQuery",
    "operationKind": "query",
    "text": "query EditableVFolderNameV2TestQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    ...EditableVFolderNameV2Fragment\n    id\n  }\n}\n\nfragment EditableVFolderNameV2Fragment on VFolder {\n  id\n  status\n  metadata {\n    name\n  }\n  ownership {\n    userId\n    projectId\n  }\n}\n"
  }
};
})();

(node as any).hash = "9cb8af61d6af9b23321b6fb17a5384a1";

export default node;

/**
 * @generated SignedSource<<18954ed196b1618b9f8fbab9e80ede04>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RolePresetDetailDrawerFragment$data = {
  readonly autoAssign: boolean;
  readonly createdAt: string;
  readonly deleted: boolean;
  readonly id: string;
  readonly name: string;
  readonly permissionEntries: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityType: string;
        readonly id: string;
        readonly permission: PermissionBit;
      };
    }>;
  } | null | undefined;
  readonly scopeType: string;
  readonly updatedAt: string;
  readonly " $fragmentType": "RolePresetDetailDrawerFragment";
};
export type RolePresetDetailDrawerFragment$key = {
  readonly " $data"?: RolePresetDetailDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePresetDetailDrawerFragment">;
};

import RolePresetDetailDrawerRefetchQuery_graphql from './RolePresetDetailDrawerRefetchQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": RolePresetDetailDrawerRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RolePresetDetailDrawerFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
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
      "name": "autoAssign",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "deleted",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "updatedAt",
      "storageKey": null
    },
    {
      "alias": "permissionEntries",
      "args": [
        {
          "kind": "Literal",
          "name": "limit",
          "value": 500
        }
      ],
      "concreteType": "RolePermissionPresetConnection",
      "kind": "LinkedField",
      "name": "permissionPresets",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "RolePermissionPresetEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "RolePermissionPreset",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "entityType",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "permission",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "permissionPresets(limit:500)"
    },
    (v0/*: any*/)
  ],
  "type": "RolePreset",
  "abstractKey": null
};
})();

(node as any).hash = "0ca02691d31767a8a27d472cceec0f3b";

export default node;

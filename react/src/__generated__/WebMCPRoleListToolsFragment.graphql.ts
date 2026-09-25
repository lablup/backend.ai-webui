/**
 * @generated SignedSource<<5a8edb8182de298e673d355a9b729521>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type WebMCPRoleListToolsFragment$data = ReadonlyArray<{
  readonly autoAssign: boolean;
  readonly createdAt: string;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly scopeId: string;
  readonly scopeType: string;
  readonly scopes: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly scopeId: string;
        readonly scopeType: string;
      };
    }>;
  } | null | undefined;
  readonly source: RoleSource;
  readonly status: RoleStatus;
  readonly updatedAt: string;
  readonly " $fragmentType": "WebMCPRoleListToolsFragment";
}>;
export type WebMCPRoleListToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPRoleListToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPRoleListToolsFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPRoleListToolsFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "source",
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
      "kind": "ScalarField",
      "name": "autoAssign",
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
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 3
        }
      ],
      "concreteType": "EntityConnection",
      "kind": "LinkedField",
      "name": "scopes",
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
          "concreteType": "EntityRefEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "EntityRef",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                (v1/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "scopes(first:3)"
    },
    (v0/*: any*/),
    (v1/*: any*/)
  ],
  "type": "Role",
  "abstractKey": null
};
})();

(node as any).hash = "db6e688145800faac030c9fcc6d74cb1";

export default node;

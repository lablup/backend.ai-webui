/**
 * @generated SignedSource<<a3fc4f6fd8a4fdc4bb62712edfe0dbbc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleAssignmentTabFragment$data = {
  readonly firstScope: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly scopeId: string;
        readonly scopeType: string;
      };
    }>;
  } | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly scopeId: string;
  readonly scopeType: string;
  readonly source: RoleSource;
  readonly " $fragmentType": "RoleAssignmentTabFragment";
};
export type RoleAssignmentTabFragment$key = {
  readonly " $data"?: RoleAssignmentTabFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleAssignmentTabFragment">;
};

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
  "metadata": null,
  "name": "RoleAssignmentTabFragment",
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
      "name": "source",
      "storageKey": null
    },
    {
      "alias": "firstScope",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 1
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
      "storageKey": "scopes(first:1)"
    },
    (v0/*: any*/),
    (v1/*: any*/)
  ],
  "type": "Role",
  "abstractKey": null
};
})();

(node as any).hash = "74ed1896ffbf0a3a99a794d66446f7c3";

export default node;

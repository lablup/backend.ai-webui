/**
 * @generated SignedSource<<e67c811f915c6ce4db57b1d52d225b75>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContainerRegistryEditorModalFragment$data = {
  readonly allowed_groups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly extra: string | null | undefined;
  readonly id: string;
  readonly is_global: boolean | null | undefined;
  readonly name: string | null | undefined;
  readonly project: string | null | undefined;
  readonly registry_name: string;
  readonly row_id: string | null | undefined;
  readonly ssl_verify: boolean | null | undefined;
  readonly type: any;
  readonly url: string;
  readonly username: string | null | undefined;
  readonly " $fragmentType": "ContainerRegistryEditorModalFragment";
};
export type ContainerRegistryEditorModalFragment$key = {
  readonly " $data"?: ContainerRegistryEditorModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ContainerRegistryEditorModalFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ContainerRegistryEditorModalFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "registry_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "project",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ssl_verify",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "extra",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "is_global",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "GroupConnection",
      "kind": "LinkedField",
      "name": "allowed_groups",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "GroupEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "GroupNode",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                (v1/*: any*/),
                (v2/*: any*/)
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
  "type": "ContainerRegistryNode",
  "abstractKey": null
};
})();

(node as any).hash = "1f50a2f4397b9d859fd801b1f3f60bf8";

export default node;

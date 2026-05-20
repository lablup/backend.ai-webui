/**
 * @generated SignedSource<<2224b84aa42131f22056f4c4dea22993>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIUserNodesFragment$data = ReadonlyArray<{
  readonly allowed_client_ip: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly container_gids: ReadonlyArray<number | null | undefined> | null | undefined;
  readonly container_main_gid: number | null | undefined;
  readonly container_uid: number | null | undefined;
  readonly created_at: string | null | undefined;
  readonly description: string | null | undefined;
  readonly domain_name: string | null | undefined;
  readonly email: string;
  readonly full_name: string | null | undefined;
  readonly id: string;
  readonly modified_at: string | null | undefined;
  readonly need_password_change: boolean | null | undefined;
  readonly project_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly resource_policy: string | null | undefined;
  readonly role: string | null | undefined;
  readonly status: string | null | undefined;
  readonly status_info: string | null | undefined;
  readonly sudo_session_enabled: boolean | null | undefined;
  readonly totp_activated: boolean | null | undefined;
  readonly username: string | null | undefined;
  readonly " $fragmentType": "BAIUserNodesFragment";
} | null | undefined>;
export type BAIUserNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIUserNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIUserNodesFragment">;
}>;

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
    "plural": true
  },
  "name": "BAIUserNodesFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": (v0/*: any*/),
      "action": "NONE"
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "email",
        "storageKey": null
      },
      "action": "NONE"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "full_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "role",
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
      "name": "username",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "created_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "modified_at",
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
      "name": "domain_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_policy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_client_ip",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "container_gids",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "container_main_gid",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "container_uid",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_info",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "sudo_session_enabled",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "need_password_change",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totp_activated",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "GroupConnection",
      "kind": "LinkedField",
      "name": "project_nodes",
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
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                (v0/*: any*/)
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
  "type": "UserNode",
  "abstractKey": null
};
})();

(node as any).hash = "e181d9e94a13d5f63058ca61b77d074f";

export default node;

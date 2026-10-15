/**
 * @generated SignedSource<<078ff496da2c73ac5e59f249f34b7da4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AuditLogActionKind = "BULK" | "GLOBAL" | "LOOKUP" | "MEMBERSHIP" | "RELATION" | "SCOPE" | "SINGLE_ENTITY" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIAuditLogTargetCellFragment$data = {
  readonly actionId: string;
  readonly actionKind: AuditLogActionKind | null | undefined;
  readonly entity: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellEntityFragment">;
  } | null | undefined;
  readonly entityId: string | null | undefined;
  readonly entityType: string | null | undefined;
  readonly lookupKey: string | null | undefined;
  readonly lookupKind: string | null | undefined;
  readonly scopes: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entity: {
          readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellEntityFragment">;
        } | null | undefined;
        readonly id: string;
        readonly scopeId: string;
        readonly scopeType: string;
      };
    }>;
  };
  readonly targetEntityId: string | null | undefined;
  readonly " $fragmentType": "BAIAuditLogTargetCellFragment";
};
export type BAIAuditLogTargetCellFragment$key = {
  readonly " $data"?: BAIAuditLogTargetCellFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "entity",
  "plural": false,
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIAuditLogTargetCellEntityFragment"
    }
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIAuditLogTargetCellFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "actionId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "actionKind",
      "storageKey": null
    },
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
      "name": "entityId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "targetEntityId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lookupKind",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lookupKey",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 3
        },
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": [
            {
              "direction": "ASC",
              "field": "SCOPE_TYPE"
            },
            {
              "direction": "ASC",
              "field": "SCOPE_ID"
            }
          ]
        }
      ],
      "concreteType": "AuditLogScopeEntryConnection",
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
          "concreteType": "AuditLogScopeEntryEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "AuditLogScopeEntry",
              "kind": "LinkedField",
              "name": "node",
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
                  "name": "scopeType",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "scopeId",
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
      "storageKey": "scopes(first:3,orderBy:[{\"direction\":\"ASC\",\"field\":\"SCOPE_TYPE\"},{\"direction\":\"ASC\",\"field\":\"SCOPE_ID\"}])"
    }
  ],
  "type": "AuditLogV2",
  "abstractKey": null
};
})();

(node as any).hash = "98192e0980f534542b04338fc3a1330c";

export default node;

/**
 * @generated SignedSource<<37f5abc0ba0251ee68fd6cbe358faff9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AuditLogActionKind = "BULK" | "GLOBAL" | "LOOKUP" | "MEMBERSHIP" | "RELATION" | "SCOPE" | "SINGLE_ENTITY" | "%future added value";
export type AuditLogStatus = "DENIED" | "ERROR" | "RUNNING" | "SUCCESS" | "UNKNOWN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIAuditLogNodesFragment$data = ReadonlyArray<{
  readonly actionId: string;
  readonly actionKind: AuditLogActionKind | null | undefined;
  readonly actionName: string;
  readonly clientIp: string | null | undefined;
  readonly createdAt: string;
  readonly description: string;
  readonly duration: string | null | undefined;
  readonly entityType: string | null | undefined;
  readonly id: string;
  readonly operation: string;
  readonly requestId: string | null | undefined;
  readonly status: AuditLogStatus;
  readonly targetEntityId: string | null | undefined;
  readonly triggeredBy: string | null | undefined;
  readonly user: {
    readonly basicInfo: {
      readonly email: string;
    };
    readonly entityId: string;
    readonly id: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellFragment">;
  readonly " $fragmentType": "BAIAuditLogNodesFragment";
}>;
export type BAIAuditLogNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIAuditLogNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogNodesFragment">;
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
  "name": "BAIAuditLogNodesFragment",
  "selections": [
    (v0/*: any*/),
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
      "name": "actionName",
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
      "name": "operation",
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
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "duration",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "requestId",
      "storageKey": null
    },
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
      "name": "entityType",
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
      "name": "triggeredBy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "clientIp",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIAuditLogTargetCellFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
          "concreteType": "UserV2BasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "email",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "AuditLogV2",
  "abstractKey": null
};
})();

(node as any).hash = "f98215c92650a524fe49e9620931335d";

export default node;

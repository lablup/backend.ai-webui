/**
 * @generated SignedSource<<ad95c6bade27aae5a1da84eea3633438>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AuditLogStatus = "ERROR" | "RUNNING" | "SUCCESS" | "UNKNOWN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIAuditLogNodesFragment$data = ReadonlyArray<{
  readonly actionId: string;
  readonly createdAt: string;
  readonly description: string;
  readonly duration: string | null | undefined;
  readonly entityId: string | null | undefined;
  readonly entityType: string;
  readonly id: string;
  readonly operation: string;
  readonly requestId: string | null | undefined;
  readonly status: AuditLogStatus;
  readonly triggeredBy: string | null | undefined;
  readonly user: {
    readonly basicInfo: {
      readonly email: string;
    };
    readonly id: string;
  } | null | undefined;
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
      "name": "entityId",
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
      "concreteType": "UserV2",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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

(node as any).hash = "f2d26f682eb8305a97c2b876d27bbdd4";

export default node;

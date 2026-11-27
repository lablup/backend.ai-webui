/**
 * @generated SignedSource<<080cb18bfcafcdd33e0737696b6d2dc5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RetentionPolicySettingModalTestQuery$variables = Record<PropertyKey, never>;
export type RetentionPolicySettingModalTestQuery$data = {
  readonly adminRetentionPolicies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"RetentionPolicySettingModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type RetentionPolicySettingModalTestQuery = {
  response: RetentionPolicySettingModalTestQuery$data;
  variables: RetentionPolicySettingModalTestQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RetentionPolicySettingModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RetentionPolicyConnection",
        "kind": "LinkedField",
        "name": "adminRetentionPolicies",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RetentionPolicyEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RetentionPolicy",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RetentionPolicySettingModalFragment"
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RetentionPolicySettingModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RetentionPolicyConnection",
        "kind": "LinkedField",
        "name": "adminRetentionPolicies",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RetentionPolicyEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RetentionPolicy",
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
                    "name": "entityId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "category",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "retentionPeriodDays",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "enabled",
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
  },
  "params": {
    "cacheID": "9b4fb23ebadb9405a9699d271c83af22",
    "id": null,
    "metadata": {},
    "name": "RetentionPolicySettingModalTestQuery",
    "operationKind": "query",
    "text": "query RetentionPolicySettingModalTestQuery {\n  adminRetentionPolicies {\n    edges {\n      node {\n        ...RetentionPolicySettingModalFragment\n        id\n      }\n    }\n  }\n}\n\nfragment RetentionPolicySettingModalFragment on RetentionPolicy {\n  id\n  entityId\n  category\n  retentionPeriodDays\n  enabled\n}\n"
  }
};

(node as any).hash = "810a651db3402953e54843b64b1c78e1";

export default node;

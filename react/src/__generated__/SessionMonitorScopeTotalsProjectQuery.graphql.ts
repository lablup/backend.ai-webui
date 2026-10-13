/**
 * @generated SignedSource<<9e33642f1a8b6fc8d3f43a279796c79b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionMonitorScopeTotalsProjectQuery$variables = {
  projectId: string;
};
export type SessionMonitorScopeTotalsProjectQuery$data = {
  readonly projectV2: {
    readonly activeResourceOverview: {
      readonly sessionCount: number;
      readonly slots: {
        readonly entries: ReadonlyArray<{
          readonly quantity: any;
          readonly resourceType: string;
        }>;
      };
    } | null | undefined;
  } | null | undefined;
};
export type SessionMonitorScopeTotalsProjectQuery = {
  response: SessionMonitorScopeTotalsProjectQuery$data;
  variables: SessionMonitorScopeTotalsProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "ActiveResourceOverview",
  "kind": "LinkedField",
  "name": "activeResourceOverview",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "sessionCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceSlot",
      "kind": "LinkedField",
      "name": "slots",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlotEntry",
          "kind": "LinkedField",
          "name": "entries",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "resourceType",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "quantity",
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionMonitorScopeTotalsProjectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "SessionMonitorScopeTotalsProjectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "41aec0e0386f6f0d30faedfff9fe7745",
    "id": null,
    "metadata": {},
    "name": "SessionMonitorScopeTotalsProjectQuery",
    "operationKind": "query",
    "text": "query SessionMonitorScopeTotalsProjectQuery(\n  $projectId: UUID!\n) {\n  projectV2(projectId: $projectId) {\n    activeResourceOverview {\n      sessionCount\n      slots {\n        entries {\n          resourceType\n          quantity\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a742ad279f2fd0a2b74e678bd11841b9";

export default node;

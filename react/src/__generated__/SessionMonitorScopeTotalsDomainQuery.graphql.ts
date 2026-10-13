/**
 * @generated SignedSource<<fa4ff1f98be4304e5668d36004a8625e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionMonitorScopeTotalsDomainQuery$variables = {
  domainName: string;
};
export type SessionMonitorScopeTotalsDomainQuery$data = {
  readonly domainV2: {
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
export type SessionMonitorScopeTotalsDomainQuery = {
  response: SessionMonitorScopeTotalsDomainQuery$data;
  variables: SessionMonitorScopeTotalsDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
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
    "name": "SessionMonitorScopeTotalsDomainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
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
    "name": "SessionMonitorScopeTotalsDomainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
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
    "cacheID": "41e35d75bdd7cf1da4ef456bc44dcfbc",
    "id": null,
    "metadata": {},
    "name": "SessionMonitorScopeTotalsDomainQuery",
    "operationKind": "query",
    "text": "query SessionMonitorScopeTotalsDomainQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    activeResourceOverview {\n      sessionCount\n      slots {\n        entries {\n          resourceType\n          quantity\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b25c9be2309edc6b6540f2d7866c6d2a";

export default node;

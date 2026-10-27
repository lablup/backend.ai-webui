/**
 * @generated SignedSource<<9dabdbf9bd84bd0e5ad498bb290ddfe7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FairSharePanelQuery$variables = {
  domainName: string;
  resourceGroupName: string;
};
export type FairSharePanelQuery$data = {
  readonly projects: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly calculationSnapshot: {
          readonly fairShareFactor: any;
          readonly normalizedUsage: any;
        };
        readonly id: string;
        readonly project: {
          readonly basicInfo: {
            readonly name: string;
          };
        } | null | undefined;
        readonly spec: {
          readonly weight: any;
        };
      };
    }>;
  } | null | undefined;
};
export type FairSharePanelQuery = {
  response: FairSharePanelQuery$data;
  variables: FairSharePanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v2 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 50
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "FAIR_SHARE_FACTOR"
      }
    ]
  },
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "domainName",
        "variableName": "domainName"
      },
      {
        "kind": "Variable",
        "name": "resourceGroupName",
        "variableName": "resourceGroupName"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "FairShareSpec",
  "kind": "LinkedField",
  "name": "spec",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "weight",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "FairShareCalculationSnapshot",
  "kind": "LinkedField",
  "name": "calculationSnapshot",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fairShareFactor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "normalizedUsage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FairSharePanelQuery",
    "selections": [
      {
        "alias": "projects",
        "args": (v2/*: any*/),
        "concreteType": "ProjectFairShareConnection",
        "kind": "LinkedField",
        "name": "rgProjectFairShares",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectFairShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectFairShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/)
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "FairSharePanelQuery",
    "selections": [
      {
        "alias": "projects",
        "args": (v2/*: any*/),
        "concreteType": "ProjectFairShareConnection",
        "kind": "LinkedField",
        "name": "rgProjectFairShares",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectFairShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectFairShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v4/*: any*/)
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ed092c0b1378c6bf36ed1f33e7d06c4a",
    "id": null,
    "metadata": {},
    "name": "FairSharePanelQuery",
    "operationKind": "query",
    "text": "query FairSharePanelQuery(\n  $resourceGroupName: String!\n  $domainName: String!\n) {\n  projects: rgProjectFairShares(scope: {resourceGroupName: $resourceGroupName, domainName: $domainName}, orderBy: [{field: FAIR_SHARE_FACTOR, direction: ASC}], limit: 50) {\n    count\n    edges {\n      node {\n        id\n        spec {\n          weight\n        }\n        calculationSnapshot {\n          fairShareFactor\n          normalizedUsage\n        }\n        project {\n          basicInfo {\n            name\n          }\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a54527b48de4d71ba9ef69b0e3a476aa";

export default node;

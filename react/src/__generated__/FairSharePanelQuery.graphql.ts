/**
 * @generated SignedSource<<7a7eb602542cad23dee7d152ef504a69>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FairSharePanelQuery$variables = {
  domainName: string;
  limit: number;
  offset: number;
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
          readonly usesDefault: boolean;
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
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v4 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "usesDefault",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = {
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
v9 = {
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
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FairSharePanelQuery",
    "selections": [
      {
        "alias": "projects",
        "args": (v4/*: any*/),
        "concreteType": "ProjectFairShareConnection",
        "kind": "LinkedField",
        "name": "rgProjectFairShares",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v9/*: any*/)
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
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "FairSharePanelQuery",
    "selections": [
      {
        "alias": "projects",
        "args": (v4/*: any*/),
        "concreteType": "ProjectFairShareConnection",
        "kind": "LinkedField",
        "name": "rgProjectFairShares",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v9/*: any*/),
                      (v6/*: any*/)
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
    "cacheID": "33642177b4ef9ffed24035f0b475db83",
    "id": null,
    "metadata": {},
    "name": "FairSharePanelQuery",
    "operationKind": "query",
    "text": "query FairSharePanelQuery(\n  $resourceGroupName: String!\n  $domainName: String!\n  $limit: Int!\n  $offset: Int!\n) {\n  projects: rgProjectFairShares(scope: {resourceGroupName: $resourceGroupName, domainName: $domainName}, orderBy: [{field: FAIR_SHARE_FACTOR, direction: ASC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        spec {\n          weight\n          usesDefault\n        }\n        calculationSnapshot {\n          fairShareFactor\n          normalizedUsage\n        }\n        project {\n          basicInfo {\n            name\n          }\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b68cd943be2d8724c883ac3267da7567";

export default node;

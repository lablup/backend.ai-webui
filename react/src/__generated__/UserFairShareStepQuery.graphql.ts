/**
 * @generated SignedSource<<83ecfed1b7b378526aa521368f54026c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserFairShareStepQuery$variables = {
  domainName: string;
  projectName?: string | null | undefined;
  resourceGroupName: string;
};
export type UserFairShareStepQuery$data = {
  readonly projectFairShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly projectId: string;
      };
    }>;
  } | null | undefined;
};
export type UserFairShareStepQuery = {
  response: UserFairShareStepQuery$data;
  variables: UserFairShareStepQuery$variables;
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
  "name": "projectName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v3 = [
  {
    "fields": [
      {
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "equals",
                "variableName": "projectName"
              }
            ],
            "kind": "ObjectValue",
            "name": "name"
          }
        ],
        "kind": "ObjectValue",
        "name": "project"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserFairShareStepQuery",
    "selections": [
      {
        "alias": "projectFairShares",
        "args": (v3/*: any*/),
        "concreteType": "ProjectFairShareConnection",
        "kind": "LinkedField",
        "name": "rgProjectFairShares",
        "plural": false,
        "selections": [
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserFairShareStepQuery",
    "selections": [
      {
        "alias": "projectFairShares",
        "args": (v3/*: any*/),
        "concreteType": "ProjectFairShareConnection",
        "kind": "LinkedField",
        "name": "rgProjectFairShares",
        "plural": false,
        "selections": [
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
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3442e8e86c01389cb25781ab53c2dc17",
    "id": null,
    "metadata": {},
    "name": "UserFairShareStepQuery",
    "operationKind": "query",
    "text": "query UserFairShareStepQuery(\n  $resourceGroupName: String!\n  $domainName: String!\n  $projectName: String\n) {\n  projectFairShares: rgProjectFairShares(scope: {resourceGroupName: $resourceGroupName, domainName: $domainName}, filter: {project: {name: {equals: $projectName}}}, limit: 1) {\n    edges {\n      node {\n        projectId\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8dc6c8be927cd59c46904bbfff9e914e";

export default node;

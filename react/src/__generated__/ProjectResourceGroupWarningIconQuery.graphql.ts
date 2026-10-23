/**
 * @generated SignedSource<<adc42c960554ca01427fbf987c028a9d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupWarningIconQuery$variables = {
  domainName: string;
  projectId: string;
  resourceGroupName: string;
};
export type ProjectResourceGroupWarningIconQuery$data = {
  readonly domainV2: {
    readonly resourceGroups: {
      readonly count: number;
    } | null | undefined;
  } | null | undefined;
  readonly projectV2: {
    readonly resourceGroups: {
      readonly count: number;
    } | null | undefined;
  } | null | undefined;
};
export type ProjectResourceGroupWarningIconQuery = {
  response: ProjectResourceGroupWarningIconQuery$data;
  variables: ProjectResourceGroupWarningIconQuery$variables;
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
  "name": "projectId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v3 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v4 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "resourceGroupName"
            }
          ],
          "kind": "ObjectValue",
          "name": "name"
        }
      ],
      "kind": "ObjectValue",
      "name": "filter"
    }
  ],
  "concreteType": "ResourceGroupConnection",
  "kind": "LinkedField",
  "name": "resourceGroups",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v5 = [
  (v4/*: any*/)
],
v6 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
  }
],
v7 = [
  (v4/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": (v5/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": (v5/*: any*/),
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
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": (v7/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": (v7/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a149a35b0cbea4deecdb97cdcdf687fc",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupWarningIconQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $resourceGroupName: String!\n) {\n  projectV2(projectId: $projectId) {\n    resourceGroups(filter: {name: {equals: $resourceGroupName}}) @since(version: \"26.9.0a1\") {\n      count\n    }\n    id\n  }\n  domainV2(domainName: $domainName) {\n    resourceGroups(filter: {name: {equals: $resourceGroupName}}) @since(version: \"26.9.0a1\") {\n      count\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b57062a200f9db23b2c804ca71a76126";

export default node;

/**
 * @generated SignedSource<<b2866f835104aea02061a0befd109138>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FoldersPanelDomainQuery$variables = {
  domainId: string;
};
export type FoldersPanelDomainQuery$data = {
  readonly ready: {
    readonly count: number;
  } | null | undefined;
  readonly trash: {
    readonly count: number;
  } | null | undefined;
};
export type FoldersPanelDomainQuery = {
  response: FoldersPanelDomainQuery$data;
  variables: FoldersPanelDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainId"
  }
],
v1 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v2 = {
  "fields": [
    {
      "items": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "value",
              "variableName": "domainId"
            }
          ],
          "kind": "ObjectValue",
          "name": "domain.0"
        }
      ],
      "kind": "ListValue",
      "name": "domain"
    }
  ],
  "kind": "ObjectValue",
  "name": "scope"
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v4 = [
  {
    "alias": "ready",
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "status": {
            "notIn": [
              "DELETE_PENDING",
              "DELETE_ONGOING",
              "DELETE_COMPLETE",
              "DELETE_ERROR"
            ]
          }
        }
      },
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "concreteType": "VFolderConnection",
    "kind": "LinkedField",
    "name": "scopedVFoldersV2",
    "plural": false,
    "selections": (v3/*: any*/),
    "storageKey": null
  },
  {
    "alias": "trash",
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "status": {
            "equals": "DELETE_PENDING"
          }
        }
      },
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "concreteType": "VFolderConnection",
    "kind": "LinkedField",
    "name": "scopedVFoldersV2",
    "plural": false,
    "selections": (v3/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FoldersPanelDomainQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FoldersPanelDomainQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "847e766d41088dfe11417cb9ca33cd52",
    "id": null,
    "metadata": {},
    "name": "FoldersPanelDomainQuery",
    "operationKind": "query",
    "text": "query FoldersPanelDomainQuery(\n  $domainId: UUID!\n) {\n  ready: scopedVFoldersV2(scope: {domain: [{value: $domainId}]}, filter: {status: {notIn: [DELETE_PENDING, DELETE_ONGOING, DELETE_COMPLETE, DELETE_ERROR]}}, limit: 1) {\n    count\n  }\n  trash: scopedVFoldersV2(scope: {domain: [{value: $domainId}]}, filter: {status: {equals: DELETE_PENDING}}, limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "bbf9411870d686ae1c535c327e46e4e6";

export default node;

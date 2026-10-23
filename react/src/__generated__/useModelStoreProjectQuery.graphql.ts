/**
 * @generated SignedSource<<ff9eb28b9afee117de0525094783afa6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type ProjectScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type useModelStoreProjectQuery$variables = {
  domainName: string;
  scope: ProjectScope;
};
export type useModelStoreProjectQuery$data = {
  readonly scopedProjectsV2: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly entityId: string;
        readonly id: string;
      };
    }>;
  } | null | undefined, unknown>;
};
export type useModelStoreProjectQuery = {
  response: useModelStoreProjectQuery$data;
  variables: useModelStoreProjectQuery$variables;
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
  "name": "scope"
},
v2 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "domainName"
            }
          ],
          "kind": "ObjectValue",
          "name": "domainName"
        },
        {
          "kind": "Literal",
          "name": "isActive",
          "value": true
        },
        {
          "kind": "Literal",
          "name": "type",
          "value": {
            "equals": "MODEL_STORE"
          }
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
      "kind": "Variable",
      "name": "scope",
      "variableName": "scope"
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "scopedProjectsV2",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2Edge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useModelStoreProjectQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v2/*: any*/),
        "to": "RESULT"
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
    "name": "useModelStoreProjectQuery",
    "selections": [
      (v2/*: any*/)
    ]
  },
  "params": {
    "cacheID": "d53988661db8a737c70ef51db44c7fe7",
    "id": null,
    "metadata": {},
    "name": "useModelStoreProjectQuery",
    "operationKind": "query",
    "text": "query useModelStoreProjectQuery(\n  $scope: ProjectScope!\n  $domainName: String!\n) {\n  scopedProjectsV2(scope: $scope, filter: {type: {equals: MODEL_STORE}, isActive: true, domainName: {equals: $domainName}}, limit: 1) {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d73f447fae59f58c2c551ea3aa509919";

export default node;

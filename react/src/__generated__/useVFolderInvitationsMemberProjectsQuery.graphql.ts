/**
 * @generated SignedSource<<8380f1140a4ac42a54bee14525340af0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useVFolderInvitationsMemberProjectsQuery$variables = Record<PropertyKey, never>;
export type useVFolderInvitationsMemberProjectsQuery$data = {
  readonly myUserV2: {
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly basicInfo: {
            readonly name: string;
          };
          readonly entityId: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type useVFolderInvitationsMemberProjectsQuery = {
  response: useVFolderInvitationsMemberProjectsQuery$data;
  variables: useVFolderInvitationsMemberProjectsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "isActive": true
    }
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v2 = {
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useVFolderInvitationsMemberProjectsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v0/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "projects",
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
                      (v1/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "projects(filter:{\"isActive\":true},limit:100)"
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
    "name": "useVFolderInvitationsMemberProjectsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v0/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "projects",
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
                      (v1/*: any*/),
                      (v2/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "projects(filter:{\"isActive\":true},limit:100)"
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3f6171d1dd7c94c7cd25c7a33239cbe4",
    "id": null,
    "metadata": {},
    "name": "useVFolderInvitationsMemberProjectsQuery",
    "operationKind": "query",
    "text": "query useVFolderInvitationsMemberProjectsQuery {\n  myUserV2 {\n    projects(filter: {isActive: true}, limit: 100) {\n      edges {\n        node {\n          entityId\n          basicInfo {\n            name\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "812b0bedf1a2ebfd285bb5948330b890";

export default node;

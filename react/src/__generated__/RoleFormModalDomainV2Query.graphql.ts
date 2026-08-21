/**
 * @generated SignedSource<<6fc2e5ed3814d079860f42151865b648>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleFormModalDomainV2Query$variables = Record<PropertyKey, never>;
export type RoleFormModalDomainV2Query$data = {
  readonly adminDomainsV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type RoleFormModalDomainV2Query = {
  response: RoleFormModalDomainV2Query$data;
  variables: RoleFormModalDomainV2Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "isActive": true
        }
      }
    ],
    "concreteType": "DomainV2Connection",
    "kind": "LinkedField",
    "name": "adminDomainsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DomainV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DomainV2",
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
                "concreteType": "DomainBasicInfo",
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
    "storageKey": "adminDomainsV2(filter:{\"isActive\":true})"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleFormModalDomainV2Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RoleFormModalDomainV2Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "67ef48fc2cdfda8deecab406e3c711d8",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalDomainV2Query",
    "operationKind": "query",
    "text": "query RoleFormModalDomainV2Query {\n  adminDomainsV2(filter: {isActive: true}) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "970b57a9079d1455b2b6474731ef4663";

export default node;

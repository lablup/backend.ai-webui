/**
 * @generated SignedSource<<e6ae63592ff435fd1d9fc8454eaba01c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EffectiveResourceAllocationV2Input = {
  projectId: string;
  resourceGroupName: string;
};
export type MyResourcesPanelQuery$variables = {
  input: EffectiveResourceAllocationV2Input;
};
export type MyResourcesPanelQuery$data = {
  readonly effectiveResourceAllocationV2: {
    readonly assignable: ReadonlyArray<{
      readonly quantity: any | null | undefined;
      readonly resourceType: string;
      readonly unlimited: boolean;
    }>;
    readonly breakdown: {
      readonly keypair: {
        readonly used: ReadonlyArray<{
          readonly quantity: any;
          readonly resourceType: string;
        }>;
      };
    };
  } | null | undefined;
};
export type MyResourcesPanelQuery = {
  response: MyResourcesPanelQuery$data;
  variables: MyResourcesPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "EffectiveResourceAllocationV2",
    "kind": "LinkedField",
    "name": "effectiveResourceAllocationV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourceLimitEntry",
        "kind": "LinkedField",
        "name": "assignable",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "unlimited",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "EffectiveBreakdownV2",
        "kind": "LinkedField",
        "name": "breakdown",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ScopeResourceUsageV2",
            "kind": "LinkedField",
            "name": "keypair",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceSlotEntry",
                "kind": "LinkedField",
                "name": "used",
                "plural": true,
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
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MyResourcesPanelQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MyResourcesPanelQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "0cb5e72b1388d645515a736b2bfa77c3",
    "id": null,
    "metadata": {},
    "name": "MyResourcesPanelQuery",
    "operationKind": "query",
    "text": "query MyResourcesPanelQuery(\n  $input: EffectiveResourceAllocationV2Input!\n) {\n  effectiveResourceAllocationV2(input: $input) {\n    assignable {\n      resourceType\n      quantity\n      unlimited\n    }\n    breakdown {\n      keypair {\n        used {\n          resourceType\n          quantity\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5fd068866ceff5e23ecb1073ef874b9b";

export default node;

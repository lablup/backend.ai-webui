/**
 * @generated SignedSource<<b4629dd3915add450ece1f60691e19d2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type EffectiveResourceAllocationV2Input = {
  projectId: string;
  resourceGroupName: string;
};
export type MyResourcesPanelQuery$variables = {
  input: EffectiveResourceAllocationV2Input;
};
export type MyResourcesPanelQuery$data = {
  readonly effectiveResourceAllocationV2: Result<{
    readonly assignable: ReadonlyArray<{
      readonly quantity: any | null | undefined;
      readonly resourceType: string;
      readonly unlimited: boolean;
    }>;
  } | null | undefined, unknown>;
  readonly myUserResourceAllocationV2: Result<{
    readonly user: {
      readonly assignable: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
      readonly used: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
  } | null | undefined, unknown>;
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
v3 = {
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
v4 = {
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
    (v3/*: any*/)
  ],
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "UserResourceAllocationV2",
  "kind": "LinkedField",
  "name": "myUserResourceAllocationV2",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ScopeResourceUsageV2",
      "kind": "LinkedField",
      "name": "user",
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
        },
        (v3/*: any*/)
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
    "name": "MyResourcesPanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v4/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v5/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MyResourcesPanelQuery",
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/)
    ]
  },
  "params": {
    "cacheID": "5b8b7db7ecc26e074d00255795fea5a8",
    "id": null,
    "metadata": {},
    "name": "MyResourcesPanelQuery",
    "operationKind": "query",
    "text": "query MyResourcesPanelQuery(\n  $input: EffectiveResourceAllocationV2Input!\n) {\n  effectiveResourceAllocationV2(input: $input) {\n    assignable {\n      resourceType\n      quantity\n      unlimited\n    }\n  }\n  myUserResourceAllocationV2 {\n    user {\n      used {\n        resourceType\n        quantity\n      }\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9b1919403b99d62fd42f9d246214c393";

export default node;

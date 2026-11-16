/**
 * @generated SignedSource<<332aa9978e6ba5dbaf6737362303144f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateAllowedDomainsForResourceGroupInput = {
  add?: ReadonlyArray<string> | null | undefined;
  remove?: ReadonlyArray<string> | null | undefined;
  resourceGroupName: string;
};
export type ResourceGroupSettingModalAssociateDomainMutation$variables = {
  input: UpdateAllowedDomainsForResourceGroupInput;
};
export type ResourceGroupSettingModalAssociateDomainMutation$data = {
  readonly adminUpdateAllowedDomainsForResourceGroupV2: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
};
export type ResourceGroupSettingModalAssociateDomainMutation = {
  response: ResourceGroupSettingModalAssociateDomainMutation$data;
  variables: ResourceGroupSettingModalAssociateDomainMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "AllowedDomainsPayload",
    "kind": "LinkedField",
    "name": "adminUpdateAllowedDomainsForResourceGroupV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "items",
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
    "name": "ResourceGroupSettingModalAssociateDomainMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupSettingModalAssociateDomainMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b3a3ad1c2dbda8d3b79f3a6aeaf43760",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalAssociateDomainMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalAssociateDomainMutation(\n  $input: UpdateAllowedDomainsForResourceGroupInput!\n) {\n  adminUpdateAllowedDomainsForResourceGroupV2(input: $input) {\n    items\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c85156647d82189655d48dec13d0b70";

export default node;

/**
 * @generated SignedSource<<f035d9ec2ae1741e36650893fb4a43fa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateResourceGroupInput = {
  description?: string | null | undefined;
  domainName: string;
  name: string;
};
export type ResourceGroupSettingModalCreateMutation$variables = {
  input: CreateResourceGroupInput;
};
export type ResourceGroupSettingModalCreateMutation$data = {
  readonly adminCreateResourceGroupV2: {
    readonly resourceGroup: {
      readonly id: string;
      readonly name: string;
    };
  } | null | undefined;
};
export type ResourceGroupSettingModalCreateMutation = {
  response: ResourceGroupSettingModalCreateMutation$data;
  variables: ResourceGroupSettingModalCreateMutation$variables;
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
    "concreteType": "CreateResourceGroupPayload",
    "kind": "LinkedField",
    "name": "adminCreateResourceGroupV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourceGroup",
        "kind": "LinkedField",
        "name": "resourceGroup",
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
            "name": "name",
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
    "name": "ResourceGroupSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7416c1829a2bb249f57f482d08ecc86e",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalCreateMutation(\n  $input: CreateResourceGroupInput!\n) {\n  adminCreateResourceGroupV2(input: $input) {\n    resourceGroup {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2b386f97e3f2956953a62f7b418d7e7c";

export default node;

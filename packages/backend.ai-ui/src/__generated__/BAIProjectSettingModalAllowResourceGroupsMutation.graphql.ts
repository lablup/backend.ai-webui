/**
 * @generated SignedSource<<9b9daca3a44680b4c3dbd08be505eae9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateAllowedResourceGroupsForProjectInput = {
  add?: ReadonlyArray<string> | null | undefined;
  projectId: string;
  remove?: ReadonlyArray<string> | null | undefined;
};
export type BAIProjectSettingModalAllowResourceGroupsMutation$variables = {
  input: UpdateAllowedResourceGroupsForProjectInput;
};
export type BAIProjectSettingModalAllowResourceGroupsMutation$data = {
  readonly adminUpdateAllowedResourceGroupsForProjectV2: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
};
export type BAIProjectSettingModalAllowResourceGroupsMutation = {
  response: BAIProjectSettingModalAllowResourceGroupsMutation$data;
  variables: BAIProjectSettingModalAllowResourceGroupsMutation$variables;
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
    "concreteType": "AllowedResourceGroupsPayload",
    "kind": "LinkedField",
    "name": "adminUpdateAllowedResourceGroupsForProjectV2",
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
    "name": "BAIProjectSettingModalAllowResourceGroupsMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectSettingModalAllowResourceGroupsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f8fd1b46122f2ba18e392b29c60ef04d",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSettingModalAllowResourceGroupsMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectSettingModalAllowResourceGroupsMutation(\n  $input: UpdateAllowedResourceGroupsForProjectInput!\n) {\n  adminUpdateAllowedResourceGroupsForProjectV2(input: $input) {\n    items\n  }\n}\n"
  }
};
})();

(node as any).hash = "5e1cf95ffd5876cf2914655dafc722b4";

export default node;

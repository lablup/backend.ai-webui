/**
 * @generated SignedSource<<cf91774407fe9b0dec826dca11070c50>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAutoScalingCardDeleteMutation$variables = {
  id: string;
};
export type DeploymentAutoScalingCardDeleteMutation$data = {
  readonly purgeAutoScalingRule: {
    readonly fieldId: string;
    readonly purgedId: string;
  };
};
export type DeploymentAutoScalingCardDeleteMutation = {
  response: DeploymentAutoScalingCardDeleteMutation$data;
  variables: DeploymentAutoScalingCardDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "PurgeAutoScalingRulePayload",
    "kind": "LinkedField",
    "name": "purgeAutoScalingRule",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purgedId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "fieldId",
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
    "name": "DeploymentAutoScalingCardDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAutoScalingCardDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fcfb1491b322ef5d512320ef227505a3",
    "id": null,
    "metadata": {},
    "name": "DeploymentAutoScalingCardDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAutoScalingCardDeleteMutation(\n  $id: UUID!\n) {\n  purgeAutoScalingRule(id: $id) {\n    purgedId\n    fieldId\n  }\n}\n"
  }
};
})();

(node as any).hash = "acf7a61edccd823cc4e8ad41668a19ba";

export default node;

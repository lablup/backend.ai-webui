/**
 * @generated SignedSource<<54cda68dbd60ee506052a08e26c23d88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ServiceLauncherPageContent_AutoScalingRulesQuery$variables = {
  endpoint_id: string;
};
export type ServiceLauncherPageContent_AutoScalingRulesQuery$data = {
  readonly endpoint_auto_scaling_rules: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type ServiceLauncherPageContent_AutoScalingRulesQuery = {
  response: ServiceLauncherPageContent_AutoScalingRulesQuery$data;
  variables: ServiceLauncherPageContent_AutoScalingRulesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endpoint_id"
  }
],
v1 = [
  {
    "alias": "endpoint_auto_scaling_rules",
    "args": [
      {
        "kind": "Variable",
        "name": "endpoint",
        "variableName": "endpoint_id"
      },
      {
        "kind": "Literal",
        "name": "first",
        "value": 1
      }
    ],
    "concreteType": "EndpointAutoScalingRuleConnection",
    "kind": "LinkedField",
    "name": "endpoint_auto_scaling_rule_nodes",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EndpointAutoScalingRuleEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EndpointAutoScalingRuleNode",
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
    "name": "ServiceLauncherPageContent_AutoScalingRulesQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ServiceLauncherPageContent_AutoScalingRulesQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d5cc1ca7edcd95bfb01b08326341be75",
    "id": null,
    "metadata": {},
    "name": "ServiceLauncherPageContent_AutoScalingRulesQuery",
    "operationKind": "query",
    "text": "query ServiceLauncherPageContent_AutoScalingRulesQuery(\n  $endpoint_id: String!\n) {\n  endpoint_auto_scaling_rules: endpoint_auto_scaling_rule_nodes(endpoint: $endpoint_id, first: 1) @since(version: \"25.1.0\") {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0ca63bc7c4d81b7c752b2e247afce33d";

export default node;

/**
 * @generated SignedSource<<706c25a0acd7b04f9760bd945db22912>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigScopeType = "DOMAIN" | "PUBLIC" | "USER" | "%future added value";
export type CreateAppConfigAllowListInput = {
  configName: string;
  rank?: number | null | undefined;
  scopeType: AppConfigScopeType;
};
export type AppConfigFixtureDiagnosticsSectionAllowListMutation$variables = {
  input: CreateAppConfigAllowListInput;
};
export type AppConfigFixtureDiagnosticsSectionAllowListMutation$data = {
  readonly adminCreateAppConfigAllowList: {
    readonly appConfigAllowList: {
      readonly id: string;
    };
  } | null | undefined;
};
export type AppConfigFixtureDiagnosticsSectionAllowListMutation = {
  response: AppConfigFixtureDiagnosticsSectionAllowListMutation$data;
  variables: AppConfigFixtureDiagnosticsSectionAllowListMutation$variables;
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
    "concreteType": "CreateAppConfigAllowListPayload",
    "kind": "LinkedField",
    "name": "adminCreateAppConfigAllowList",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AppConfigAllowList",
        "kind": "LinkedField",
        "name": "appConfigAllowList",
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AppConfigFixtureDiagnosticsSectionAllowListMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionAllowListMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0756c71baa1129cd9aa99d947fec25cd",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionAllowListMutation",
    "operationKind": "mutation",
    "text": "mutation AppConfigFixtureDiagnosticsSectionAllowListMutation(\n  $input: CreateAppConfigAllowListInput!\n) {\n  adminCreateAppConfigAllowList(input: $input) {\n    appConfigAllowList {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "32e67e956f30c35b772755d3d3818123";

export default node;

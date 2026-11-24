/**
 * @generated SignedSource<<aa8fdb57ca8227f60531d763cefb00a7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateAppConfigDefinitionInput = {
  configName: string;
};
export type AppConfigFixtureDiagnosticsSectionDefinitionMutation$variables = {
  input: CreateAppConfigDefinitionInput;
};
export type AppConfigFixtureDiagnosticsSectionDefinitionMutation$data = {
  readonly adminCreateAppConfigDefinition: {
    readonly appConfigDefinition: {
      readonly id: string;
    };
  } | null | undefined;
};
export type AppConfigFixtureDiagnosticsSectionDefinitionMutation = {
  response: AppConfigFixtureDiagnosticsSectionDefinitionMutation$data;
  variables: AppConfigFixtureDiagnosticsSectionDefinitionMutation$variables;
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
    "concreteType": "CreateAppConfigDefinitionPayload",
    "kind": "LinkedField",
    "name": "adminCreateAppConfigDefinition",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AppConfigDefinition",
        "kind": "LinkedField",
        "name": "appConfigDefinition",
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
    "name": "AppConfigFixtureDiagnosticsSectionDefinitionMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionDefinitionMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9c9833746108e35e360ae2b5ff6f25fd",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionDefinitionMutation",
    "operationKind": "mutation",
    "text": "mutation AppConfigFixtureDiagnosticsSectionDefinitionMutation(\n  $input: CreateAppConfigDefinitionInput!\n) {\n  adminCreateAppConfigDefinition(input: $input) {\n    appConfigDefinition {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c5645acf0d17eb896b873b7dcba68bd4";

export default node;

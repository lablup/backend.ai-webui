/**
 * @generated SignedSource<<202bfd18b3bfada0e94ea7f919a1010b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigMergedQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useAppConfigMergedQuery$data = {
  readonly myAppConfigs: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
  }>;
};
export type useAppConfigMergedQuery = {
  response: useAppConfigMergedQuery$data;
  variables: useAppConfigMergedQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "configNames"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "configNames",
        "variableName": "configNames"
      }
    ],
    "concreteType": "AppConfig",
    "kind": "LinkedField",
    "name": "myAppConfigs",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "configName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "config",
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
    "name": "useAppConfigMergedQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigMergedQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "490bda848adf705d273fc8080738c410",
    "id": null,
    "metadata": {},
    "name": "useAppConfigMergedQuery",
    "operationKind": "query",
    "text": "query useAppConfigMergedQuery(\n  $configNames: [String!]!\n) {\n  myAppConfigs(configNames: $configNames) {\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "9873ab8c1b945548a665462a65d57bba";

export default node;

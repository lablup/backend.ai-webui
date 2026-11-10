/**
 * @generated SignedSource<<02201456424749d8b1750f011c724023>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigPublicQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useAppConfigPublicQuery$data = {
  readonly publicAppConfigs: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
  }>;
};
export type useAppConfigPublicQuery = {
  response: useAppConfigPublicQuery$data;
  variables: useAppConfigPublicQuery$variables;
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
    "name": "publicAppConfigs",
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
    "name": "useAppConfigPublicQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigPublicQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "68c288e53c4c1040af4adcb18d478ea4",
    "id": null,
    "metadata": {},
    "name": "useAppConfigPublicQuery",
    "operationKind": "query",
    "text": "query useAppConfigPublicQuery(\n  $configNames: [String!]!\n) {\n  publicAppConfigs(configNames: $configNames) {\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "198a90073dc62b2acc37dc2bf78cb638";

export default node;

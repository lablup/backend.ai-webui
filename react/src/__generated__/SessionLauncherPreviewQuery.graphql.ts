/**
 * @generated SignedSource<<f8468b428fea3a3a083c4ef43a1b1a9d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionLauncherPreviewQuery$variables = Record<PropertyKey, never>;
export type SessionLauncherPreviewQuery$data = {
  readonly resource_presets: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type SessionLauncherPreviewQuery = {
  response: SessionLauncherPreviewQuery$data;
  variables: SessionLauncherPreviewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourcePreset",
    "kind": "LinkedField",
    "name": "resource_presets",
    "plural": true,
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionLauncherPreviewQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SessionLauncherPreviewQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "dae2087e0b9f3723902e485921fe2b6c",
    "id": null,
    "metadata": {},
    "name": "SessionLauncherPreviewQuery",
    "operationKind": "query",
    "text": "query SessionLauncherPreviewQuery {\n  resource_presets {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "33be45f077e02ffcbc14d26033679849";

export default node;

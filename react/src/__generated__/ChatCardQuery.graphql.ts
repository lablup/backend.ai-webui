/**
 * @generated SignedSource<<c9b11cc78d999a8adae74bc3eee94da9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type ChatCardQuery$variables = {
  endpointId: string;
};
export type ChatCardQuery$data = {
  readonly endpoint: Result<{
    readonly endpoint_id: string | null | undefined;
    readonly url: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ChatHeader_Endpoint">;
  } | null | undefined, unknown>;
};
export type ChatCardQuery = {
  response: ChatCardQuery$data;
  variables: ChatCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endpointId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "endpoint_id",
    "variableName": "endpointId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ChatCardQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "Endpoint",
          "kind": "LinkedField",
          "name": "endpoint",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            (v3/*: any*/),
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ChatHeader_Endpoint"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ChatCardQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "6e2c7cca467d32f74de4ddf840a8f08a",
    "id": null,
    "metadata": {},
    "name": "ChatCardQuery",
    "operationKind": "query",
    "text": "query ChatCardQuery(\n  $endpointId: UUID!\n) {\n  endpoint(endpoint_id: $endpointId) {\n    endpoint_id\n    url\n    ...ChatHeader_Endpoint\n    id\n  }\n}\n\nfragment ChatHeader_Endpoint on Endpoint {\n  endpoint_id\n}\n"
  }
};
})();

(node as any).hash = "5ff3fd270fca0bac7779be279e93341e";

export default node;

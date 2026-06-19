/**
 * @generated SignedSource<<66d5074596f4c4c9082e6df0b8a2131b>>
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
    readonly replicas: number | null | undefined;
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
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "replicas",
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
            (v4/*: any*/),
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
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
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
    "cacheID": "99c9ded5ee686463528762c94e09697b",
    "id": null,
    "metadata": {},
    "name": "ChatCardQuery",
    "operationKind": "query",
    "text": "query ChatCardQuery(\n  $endpointId: UUID!\n) {\n  endpoint(endpoint_id: $endpointId) {\n    endpoint_id\n    url\n    replicas\n    ...ChatHeader_Endpoint\n    id\n  }\n}\n\nfragment ChatHeader_Endpoint on Endpoint {\n  endpoint_id\n  name\n}\n"
  }
};
})();

(node as any).hash = "d528439518d2d61f340b117a8ac42ee8";

export default node;

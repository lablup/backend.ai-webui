/**
 * @generated SignedSource<<aad5342744a3db7f46661649c913b108>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useBAIAppConfigDomainIdQuery$variables = {
  domainName: string;
};
export type useBAIAppConfigDomainIdQuery$data = {
  readonly domainV2: {
    readonly entityId: string;
    readonly id: string;
  } | null | undefined;
};
export type useBAIAppConfigDomainIdQuery = {
  response: useBAIAppConfigDomainIdQuery$data;
  variables: useBAIAppConfigDomainIdQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "domainName",
        "variableName": "domainName"
      }
    ],
    "concreteType": "DomainV2",
    "kind": "LinkedField",
    "name": "domainV2",
    "plural": false,
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
        "name": "entityId",
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
    "name": "useBAIAppConfigDomainIdQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useBAIAppConfigDomainIdQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "146d0d008a79f3666b0ad24eacf91451",
    "id": null,
    "metadata": {},
    "name": "useBAIAppConfigDomainIdQuery",
    "operationKind": "query",
    "text": "query useBAIAppConfigDomainIdQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    id\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "d607bb8dbfeb6844fe4cf21fce5e29ab";

export default node;

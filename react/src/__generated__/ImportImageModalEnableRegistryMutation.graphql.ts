/**
 * @generated SignedSource<<d14096e0f34af725845fe58e930566e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportImageModalEnableRegistryMutation$variables = {
  allowed_docker_registries: ReadonlyArray<string | null | undefined>;
  domain: string;
};
export type ImportImageModalEnableRegistryMutation$data = {
  readonly modify_domain: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ImportImageModalEnableRegistryMutation = {
  response: ImportImageModalEnableRegistryMutation$data;
  variables: ImportImageModalEnableRegistryMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allowed_docker_registries"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domain"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "domain"
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "allowed_docker_registries",
            "variableName": "allowed_docker_registries"
          }
        ],
        "kind": "ObjectValue",
        "name": "props"
      }
    ],
    "concreteType": "ModifyDomain",
    "kind": "LinkedField",
    "name": "modify_domain",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportImageModalEnableRegistryMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImportImageModalEnableRegistryMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "e43138c11072c938595d5a11c48376f4",
    "id": null,
    "metadata": {},
    "name": "ImportImageModalEnableRegistryMutation",
    "operationKind": "mutation",
    "text": "mutation ImportImageModalEnableRegistryMutation(\n  $domain: String!\n  $allowed_docker_registries: [String]!\n) {\n  modify_domain(name: $domain, props: {allowed_docker_registries: $allowed_docker_registries}) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "71e3300236cc2f52e2ee9e4c9c28334b";

export default node;

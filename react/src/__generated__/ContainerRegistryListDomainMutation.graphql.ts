/**
 * @generated SignedSource<<4f4f12c24752a271bb19dcdc0f9542bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryListDomainMutation$variables = {
  allowed_docker_registries: ReadonlyArray<string | null | undefined>;
  domain: string;
};
export type ContainerRegistryListDomainMutation$data = {
  readonly modify_domain: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ContainerRegistryListDomainMutation = {
  response: ContainerRegistryListDomainMutation$data;
  variables: ContainerRegistryListDomainMutation$variables;
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
    "name": "ContainerRegistryListDomainMutation",
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
    "name": "ContainerRegistryListDomainMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "5ea7ebdd79d15e15b23a9fb2d8568d34",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListDomainMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryListDomainMutation(\n  $domain: String!\n  $allowed_docker_registries: [String]!\n) {\n  modify_domain(name: $domain, props: {allowed_docker_registries: $allowed_docker_registries}) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "647ec7cdf3bcffc8cc1d8cd3cced159f";

export default node;

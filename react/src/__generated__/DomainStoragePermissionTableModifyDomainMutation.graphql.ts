/**
 * @generated SignedSource<<4c6f1a065a5b94875997e9ebbcf2a496>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyDomainInput = {
  allowed_docker_registries?: ReadonlyArray<string | null | undefined> | null | undefined;
  allowed_vfolder_hosts?: string | null | undefined;
  description?: string | null | undefined;
  integration_id?: string | null | undefined;
  is_active?: boolean | null | undefined;
  name?: string | null | undefined;
  total_resource_slots?: string | null | undefined;
};
export type DomainStoragePermissionTableModifyDomainMutation$variables = {
  name: string;
  props: ModifyDomainInput;
};
export type DomainStoragePermissionTableModifyDomainMutation$data = {
  readonly modify_domain: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type DomainStoragePermissionTableModifyDomainMutation = {
  response: DomainStoragePermissionTableModifyDomainMutation$data;
  variables: DomainStoragePermissionTableModifyDomainMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DomainStoragePermissionTableModifyDomainMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DomainStoragePermissionTableModifyDomainMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "31fb467f7935084689b1bf83867aa1e1",
    "id": null,
    "metadata": {},
    "name": "DomainStoragePermissionTableModifyDomainMutation",
    "operationKind": "mutation",
    "text": "mutation DomainStoragePermissionTableModifyDomainMutation(\n  $name: String!\n  $props: ModifyDomainInput!\n) {\n  modify_domain(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "c38da7fd004aed86edcefead159def0d";

export default node;

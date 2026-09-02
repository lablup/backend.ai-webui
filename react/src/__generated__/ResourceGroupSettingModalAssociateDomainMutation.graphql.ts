/**
 * @generated SignedSource<<b68bf92f7dc53a5d1012bc2fd7294441>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceGroupSettingModalAssociateDomainMutation$variables = {
  domain: string;
  scaling_group: string;
};
export type ResourceGroupSettingModalAssociateDomainMutation$data = {
  readonly associate_scaling_group_with_domain: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourceGroupSettingModalAssociateDomainMutation = {
  response: ResourceGroupSettingModalAssociateDomainMutation$data;
  variables: ResourceGroupSettingModalAssociateDomainMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domain"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scaling_group"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "domain",
        "variableName": "domain"
      },
      {
        "kind": "Variable",
        "name": "scaling_group",
        "variableName": "scaling_group"
      }
    ],
    "concreteType": "AssociateScalingGroupWithDomain",
    "kind": "LinkedField",
    "name": "associate_scaling_group_with_domain",
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
    "name": "ResourceGroupSettingModalAssociateDomainMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupSettingModalAssociateDomainMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "72535173512804feacec89a7cabb4ac3",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalAssociateDomainMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalAssociateDomainMutation(\n  $domain: String!\n  $scaling_group: String!\n) {\n  associate_scaling_group_with_domain(domain: $domain, scaling_group: $scaling_group) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "a1253f2e15bdfc1e59cdf2b26bc0a273";

export default node;

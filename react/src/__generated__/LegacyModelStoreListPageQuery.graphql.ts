/**
 * @generated SignedSource<<a9021b4d89cde600c5f6783d3d2d3561>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LegacyModelStoreListPageQuery$variables = {
  filter?: string | null | undefined;
};
export type LegacyModelStoreListPageQuery$data = {
  readonly model_cards: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: string | null | undefined;
        readonly description: string | null | undefined;
        readonly error_msg: string | null | undefined;
        readonly id: string;
        readonly label: ReadonlyArray<string | null | undefined> | null | undefined;
        readonly modified_at: string | null | undefined;
        readonly name: string | null | undefined;
        readonly task: string | null | undefined;
        readonly title: string | null | undefined;
        readonly vfolder_node: {
          readonly cloneable: boolean | null | undefined;
          readonly host: string | null | undefined;
        } | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"LegacyModelCardModalFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type LegacyModelStoreListPageQuery = {
  response: LegacyModelStoreListPageQuery$data;
  variables: LegacyModelStoreListPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 200
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "task",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "modified_at",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error_msg",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cloneable",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LegacyModelStoreListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelCardConnection",
        "kind": "LinkedField",
        "name": "model_cards",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelCard",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VirtualFolderNode",
                    "kind": "LinkedField",
                    "name": "vfolder_node",
                    "plural": false,
                    "selections": [
                      (v11/*: any*/),
                      (v12/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "LegacyModelCardModalFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "LegacyModelStoreListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelCardConnection",
        "kind": "LinkedField",
        "name": "model_cards",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelCard",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VirtualFolderNode",
                    "kind": "LinkedField",
                    "name": "vfolder_node",
                    "plural": false,
                    "selections": [
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v2/*: any*/),
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "row_id",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "author",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "version",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "created_at",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "architecture",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "framework",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "license",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "readme",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "min_resource",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "cdb9fe4f547bf27cc711eacfe675633e",
    "id": null,
    "metadata": {},
    "name": "LegacyModelStoreListPageQuery",
    "operationKind": "query",
    "text": "query LegacyModelStoreListPageQuery(\n  $filter: String\n) {\n  model_cards(filter: $filter, first: 200) {\n    edges {\n      node {\n        id\n        name\n        title\n        description\n        task\n        category\n        label\n        modified_at\n        error_msg\n        vfolder_node {\n          cloneable\n          host\n          id\n        }\n        ...LegacyModelCardModalFragment\n      }\n    }\n  }\n}\n\nfragment LegacyModelCardModalFragment on ModelCard {\n  id\n  name\n  author\n  title\n  version\n  created_at\n  modified_at\n  description\n  task\n  category\n  architecture\n  framework\n  label\n  license\n  readme\n  min_resource\n  vfolder_node {\n    id\n    name\n    cloneable\n    ...ModelCloneModalVFolderFragment\n    ...LegacyModelTryContentButtonVFolderFragment\n    ...VFolderNodeIdenticonFragment\n  }\n  error_msg\n}\n\nfragment LegacyModelTryContentButtonVFolderFragment on VirtualFolderNode {\n  id\n  row_id\n  name\n  host\n}\n\nfragment ModelCloneModalVFolderFragment on VirtualFolderNode {\n  id\n  row_id\n  name\n  host\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "5abadc84829e953ee75a26a8a0049b64";

export default node;

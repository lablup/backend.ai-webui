/**
 * Custom ESLint rules for Backend.AI WebUI (Relay conventions).
 *
 * Exposed as a flat-config plugin object so both the `react/` app and the
 * `packages/backend.ai-ui/` component library — which share this config via
 * `eslint-config-bai` — pick the rules up.
 */

const KEY_SUFFIX = "$key";

const isKeyTypeName = (name) =>
  typeof name === "string" && name.endsWith(KEY_SUFFIX);

const baseFragmentName = (keyTypeName) =>
  keyTypeName.slice(0, -KEY_SUFFIX.length);

/**
 * Collect GraphQL fragment definitions and named fragment spreads from the
 * cooked text of a graphql`` tagged template literal.
 *
 * Relay literals in this codebase contain no `${}` interpolation (fragments
 * are referenced as the textual `...Name`), so the concatenated quasi text is
 * the complete document and a textual scan is sufficient. Working off the
 * graphql literal text — rather than the whole source — is what keeps JS
 * spread operators and doc strings from being mistaken for fragment spreads.
 */
const scanGraphqlText = (text, defined, spread) => {
  const defRe = /\bfragment\s+([A-Za-z_]\w*)\s+on\s/g;
  let m;
  while ((m = defRe.exec(text)) !== null) {
    defined.add(m[1]);
  }
  const spreadRe = /\.\.\.\s*([A-Za-z_]\w*)/g;
  while ((m = spreadRe.exec(text)) !== null) {
    // `... on Type` is an inline fragment, not a named fragment spread.
    if (m[1] !== "on") {
      spread.add(m[1]);
    }
  }
};

/**
 * Recursively collect TSTypeReference nodes whose name ends with `$key`,
 * walking only structural type positions (unions, arrays, generic args,
 * wrappers). Function-type parameters are intentionally NOT walked: a
 * `$key` in a parameter position is a fragment-component prop/callback
 * contract, which is the correct place to use the generated `$key` type.
 */
const collectKeyTypeRefs = (typeNode, out) => {
  if (!typeNode || typeof typeNode !== "object") {
    return;
  }
  if (
    typeNode.type === "TSTypeReference" &&
    typeNode.typeName?.type === "Identifier" &&
    isKeyTypeName(typeNode.typeName.name)
  ) {
    out.push(typeNode);
  }
  if (Array.isArray(typeNode.types)) {
    typeNode.types.forEach((c) => collectKeyTypeRefs(c, out));
  }
  if (typeNode.elementType) {
    collectKeyTypeRefs(typeNode.elementType, out);
  }
  if (typeNode.typeAnnotation) {
    collectKeyTypeRefs(typeNode.typeAnnotation, out);
  }
  const typeArgs = typeNode.typeArguments || typeNode.typeParameters;
  if (typeArgs && Array.isArray(typeArgs.params)) {
    typeArgs.params.forEach((c) => collectKeyTypeRefs(c, out));
  }
};

/**
 * Disallow typing a *local value* (a `useState` cell or a plain variable)
 * with a fragment's generated `$key` type at a site that already spreads that
 * fragment in a graphql literal.
 *
 * When a component spreads `...Foo` in its own query/fragment, the
 * `useFragment` / query response already yields a value whose type carries
 * `$fragmentSpreads` and is directly assignable to `Foo$key`. So the spreading
 * site never needs to import `Foo$key` — it should derive the type from its
 * own query node type instead. Importing the child fragment's `$key` here only
 * adds type coupling to the child.
 *
 * Exemptions (NOT reported):
 *  - the fragment-owning file, which DEFINES `fragment Foo on ...` (it
 *    legitimately uses `Foo$key` for its prop and/or `useFragment<Foo$key>`);
 *  - prop / callback-parameter positions (a fragment ref typed `Foo$key` that
 *    is received from a parent, the standard fragment-component pattern);
 *  - files that do not spread `...Foo` at all (the ref is sourced elsewhere).
 *
 * This is a project convention, not a Relay-mandated rule.
 */
const noFragmentKeyAtSpreadSite = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow typing a local value with a fragment's generated $key type at a site that already spreads that fragment; derive the type from the local query node instead.",
    },
    schema: [],
    messages: {
      deriveLocally:
        "This file spreads `...{{fragment}}` in a graphql literal, so the query/fragment response already yields a value assignable to `{{name}}`. Type this {{position}} with your own query's node type instead of the child fragment's `{{name}}` (and drop the import if nothing else uses it).",
    },
  },
  create(context) {
    const definedFragments = new Set();
    const spreadFragments = new Set();
    const candidates = [];

    const getTypeArguments = (node) =>
      node.typeArguments || node.typeParameters || null;

    return {
      TaggedTemplateExpression(node) {
        if (node.tag.type !== "Identifier" || node.tag.name !== "graphql") {
          return;
        }
        const text = node.quasi.quasis
          .map((q) => (q.value && (q.value.cooked ?? q.value.raw)) || "")
          .join("\n");
        scanGraphqlText(text, definedFragments, spreadFragments);
      },

      // useState<...$key>() / useState<...$key | null>()
      CallExpression(node) {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "useState"
        ) {
          return;
        }
        const typeArgs = getTypeArguments(node);
        if (!typeArgs || !typeArgs.params || typeArgs.params.length === 0) {
          return;
        }
        const refs = [];
        collectKeyTypeRefs(typeArgs.params[0], refs);
        refs.forEach((ref) =>
          candidates.push({
            node: ref,
            name: ref.typeName.name,
            position: "state",
          }),
        );
      },

      // const x: ...$key = ...   (plain local variable annotation)
      VariableDeclarator(node) {
        if (
          node.id?.type !== "Identifier" ||
          !node.id.typeAnnotation?.typeAnnotation
        ) {
          return;
        }
        const refs = [];
        collectKeyTypeRefs(node.id.typeAnnotation.typeAnnotation, refs);
        refs.forEach((ref) =>
          candidates.push({
            node: ref,
            name: ref.typeName.name,
            position: "variable",
          }),
        );
      },

      "Program:exit"() {
        for (const candidate of candidates) {
          const base = baseFragmentName(candidate.name);
          // The file owns the fragment — `$key` for its own prop is correct.
          if (definedFragments.has(base)) {
            continue;
          }
          // The ref is not produced by a local spread — sourced from a prop.
          if (!spreadFragments.has(base)) {
            continue;
          }
          context.report({
            node: candidate.node,
            messageId: "deriveLocally",
            data: {
              fragment: base,
              name: candidate.name,
              position: candidate.position,
            },
          });
        }
      },
    };
  },
};

export default {
  rules: {
    "no-fragment-key-at-spread-site": noFragmentKeyAtSpreadSite,
  },
};

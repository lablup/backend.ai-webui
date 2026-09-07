/**
 * Custom ESLint rules for Backend.AI WebUI (Relay conventions), exposed as a
 * flat-config plugin so both `react/` and `packages/backend.ai-ui/` pick them
 * up through `eslint-config-bai`.
 */

const KEY_SUFFIX = "$key";

const isKeyTypeName = (name) =>
  typeof name === "string" && name.endsWith(KEY_SUFFIX);

const baseFragmentName = (keyTypeName) =>
  keyTypeName.slice(0, -KEY_SUFFIX.length);

/**
 * Collect fragment definitions and named spreads from a graphql`` literal's
 * text. Relay literals carry no `${}` interpolation, so a textual scan of the
 * quasis is the whole document — and scanning the literal rather than the
 * source is what keeps JS spread operators and doc strings out of the result.
 */
const scanGraphqlText = (text, defined, spread) => {
  const defRe = /\bfragment\s+([A-Za-z_]\w*)\s+on\s/g;
  let m;
  while ((m = defRe.exec(text)) !== null) {
    defined.add(m[1]);
  }
  const spreadRe = /\.\.\.\s*([A-Za-z_]\w*)/g;
  while ((m = spreadRe.exec(text)) !== null) {
    // `... on Type` is an inline fragment, not a named spread.
    if (m[1] !== "on") {
      spread.add(m[1]);
    }
  }
};

/**
 * Collect `*$key` type references from structural type positions (unions,
 * arrays, generic args, wrappers). Function-type parameters are deliberately
 * not walked: a `$key` there is the fragment-component prop contract.
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
 * Disallow typing a local value (a `useState` cell or a plain variable) with a
 * fragment's generated `$key` at a site that already spreads that fragment:
 * the local query response is already assignable to `Foo$key`, so importing
 * the child's `$key` only adds type coupling. A project convention, not a
 * Relay requirement.
 *
 * Exempt: the fragment-owning file (it DEFINES the fragment), prop/callback
 * parameter positions, and files that never spread the fragment.
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
          if (definedFragments.has(base) || !spreadFragments.has(base)) {
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

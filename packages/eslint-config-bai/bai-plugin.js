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
 * Blank out GraphQL `#` comments and string / block-string tokens so the
 * scan below reads syntax only: a `# ...Foo` note must not register a spread,
 * and `fragment Foo on Node` inside a description must not exempt a violation.
 */
const stripCommentsAndStrings = (text) => {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "#") {
      while (i < text.length && text[i] !== "\n") {
        i += 1;
      }
      continue;
    }
    if (text.startsWith('"""', i)) {
      // `\"""` is the one escape a block string has; it is not the delimiter.
      let j = i + 3;
      while (j < text.length && !text.startsWith('"""', j)) {
        j += text[j] === "\\" && text.startsWith('"""', j + 1) ? 4 : 1;
      }
      i = j >= text.length ? text.length : j + 3;
      out += " ";
      continue;
    }
    if (text[i] === '"') {
      i += 1;
      while (i < text.length && text[i] !== '"' && text[i] !== "\n") {
        i += text[i] === "\\" ? 2 : 1;
      }
      i += 1;
      out += " ";
      continue;
    }
    out += text[i];
    i += 1;
  }
  return out;
};

/**
 * Collect fragment definitions and named spreads from a graphql`` literal's
 * text. Relay literals carry no `${}` interpolation, so a textual scan of the
 * quasis is the whole document — and scanning the literal rather than the
 * source is what keeps JS spread operators and doc strings out of the result.
 */
const scanGraphqlText = (rawText, defined, spread) => {
  const text = stripCommentsAndStrings(rawText);
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

/** Both call forms in use here: bare `useState` and `React.useState`. */
const isUseStateCallee = (callee) => {
  if (callee.type === "Identifier") {
    return callee.name === "useState";
  }
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property?.type === "Identifier" &&
    callee.property.name === "useState"
  );
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

      // useState<...$key>() / React.useState<...$key | null>()
      CallExpression(node) {
        if (!isUseStateCallee(node.callee)) {
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

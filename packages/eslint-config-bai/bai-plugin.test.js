import baiPlugin from "./bai-plugin.js";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run(
  "no-fragment-key-at-spread-site",
  baiPlugin.rules["no-fragment-key-at-spread-site"],
  {
    valid: [
      // The fragment-owning file: it DEFINES `Foo`, so `Foo$key` is its own
      // prop / useFragment contract.
      `
      const f = graphql\`
        fragment Foo on Node {
          ...Bar
          id
        }
      \`;
      const [x, setX] = useState<Foo$key | null>(null);
      `,
      // No local spread of `Foo` — the ref comes from a prop.
      `
      const q = graphql\`
        query Q {
          node { id }
        }
      \`;
      const [x, setX] = useState<Foo$key | null>(null);
      `,
      // Parameter positions are the fragment-component prop contract.
      `
      const q = graphql\`
        query Q {
          node { ...Foo }
        }
      \`;
      const cb: (ref: Foo$key) => void = () => {};
      `,
      // `... on Type` is an inline fragment, not a named spread.
      `
      const q = graphql\`
        query Q {
          node { ... on Session { id } }
        }
      \`;
      const [x, setX] = useState<Foo$key | null>(null);
      `,
      // A JS spread outside a graphql literal must not register as a spread.
      `
      const q = graphql\`
        query Q {
          node { id }
        }
      \`;
      const merged = { ...Foo };
      const [x, setX] = useState<Foo$key | null>(null);
      `,
      // A spread named only inside a `#` comment is not a spread.
      `
      const q = graphql\`
        query Q {
          # ...Foo is deliberately not selected here
          node { id }
        }
      \`;
      const [x, setX] = useState<Foo$key | null>(null);
      `,
      // A block string closes at its first UNESCAPED `"""`; the `\\"""` escape
      // must not end it early and let the rest be scanned as syntax.
      `
      const q = graphql\`
        query Q {
          node(label: """a \\\\""" ...Foo still inside the string""") { id }
        }
      \`;
      const [x, setX] = useState<Foo$key | null>(null);
      `,
      // A spread named only inside a string argument is not a spread either.
      `
      const q = graphql\`
        query Q {
          node(label: "...Foo") { id }
        }
      \`;
      const [x, setX] = useState<Foo$key | null>(null);
      `,
    ],
    invalid: [
      {
        code: `
        const q = graphql\`
          query Q {
            node { ...Foo }
          }
        \`;
        const [x, setX] = useState<Foo$key | null>(null);
        `,
        errors: [{ messageId: "deriveLocally" }],
      },
      // Plural fragment refs are reached through the array element type.
      {
        code: `
        const q = graphql\`
          query Q {
            nodes { ...Foo }
          }
        \`;
        const [x, setX] = useState<ReadonlyArray<Foo$key>>([]);
        `,
        errors: [{ messageId: "deriveLocally" }],
      },
      // A plain local variable annotation, not just useState.
      {
        code: `
        const q = graphql\`
          query Q {
            node { ...Foo }
          }
        \`;
        const ref: Foo$key = q.node;
        `,
        errors: [{ messageId: "deriveLocally" }],
      },
      // The spread may appear in a fragment the file spreads into, and the
      // definition of a DIFFERENT fragment must not exempt it.
      {
        code: `
        const f = graphql\`
          fragment Own on Node {
            ...Foo
          }
        \`;
        const [x, setX] = useState<Foo$key | null>(null);
        `,
        errors: [{ messageId: "deriveLocally" }],
      },
      // A `fragment Foo on ...` that only appears in a comment or a string
      // does not make this the fragment-owning file.
      {
        code: `
        const q = graphql\`
          query Q {
            # fragment Foo on Node lives in another file
            node(label: "fragment Foo on Node") { ...Foo }
          }
        \`;
        const [x, setX] = useState<Foo$key | null>(null);
        `,
        errors: [{ messageId: "deriveLocally" }],
      },
      // `React.useState` is the same declaration, spelled through the import.
      {
        code: `
        const q = graphql\`
          query Q {
            node { ...Foo }
          }
        \`;
        const [x, setX] = React.useState<Foo$key | null>(null);
        `,
        errors: [{ messageId: "deriveLocally" }],
      },
    ],
  },
);

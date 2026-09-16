// relay.config.js
const fs = require("fs");
const path = require("path");

// Merge schema.graphql, the compat files and client-directives.graphql into
// merged_schema.graphql. A compat file's `extend type|input X { … }` blocks are
// folded into X's definition here because relay-compiler does not implement
// input-object extensions. A block may not repeat a field X still defines.
const read = (file) => fs.readFileSync(path.join(__dirname, file), "utf8");
const fieldNames = (body) =>
  [...body.matchAll(/^  (\w+)\s*[(:]/gm)].map((match) => match[1]);
const foldExtensions = (schema, compat) => {
  const extension = /^extend (type|input) (\w+) \{\n([\s\S]*?)^\}\n/gm;
  let folded = schema;
  const rest = compat.replace(extension, (_, kind, name, fields) => {
    const definition = new RegExp(
      `^${kind} ${name}\\b[^{]*\\{[\\s\\S]*?^(?=\\})`,
      "m",
    );
    if (!definition.test(folded)) {
      throw new Error(`compat schema extends unknown ${kind} ${name}`);
    }
    folded = folded.replace(definition, (body) => {
      const existing = fieldNames(body);
      const repeated = fieldNames(fields).filter((field) =>
        existing.includes(field),
      );
      if (repeated.length > 0) {
        throw new Error(
          `compat schema repeats ${kind} ${name} field ${repeated.join(", ")}`,
        );
      }
      return `${body}${fields}`;
    });
    return "";
  });
  return `${folded}\n${rest}`;
};
// Definitions the manager version data/schema.graphql was copied from retired,
// still selected under @deprecatedSince for older managers (ADR 0005).
const compatFiles = ["./data/compat/rbac-manager-26-8.graphql"];
const mergedSchema = [
  compatFiles.reduce(
    (schema, file) => foldExtensions(schema, read(file)),
    read("./data/schema.graphql"),
  ),
  read("./data/client-directives.graphql"),
].join("\n");
fs.writeFileSync(
  path.join(__dirname, "./data/merged_schema.graphql"),
  mergedSchema,
);

module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  language: "typescript", // "javascript" | "typescript" | "flow"
  schema: "data/merged_schema.graphql",
  // noFutureProofEnums: true,
  featureFlags: {
    // enable_relay_resolver_transform: true,
  },
  customScalarTypes: {
    // Be careful, the value of this setting is a typescript type. It is not a `String`.
    // https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#number-string-boolean-symbol-and-object
    DateTime: "string",
    UUID: "string",
    JSONString: "string",
  },
};

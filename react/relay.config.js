// relay.config.js
const fs = require("fs");
const path = require("path");

// function to merge schema.graphql and client-directives.graphql and write to merged_schema.graphql
const schemaFiles = [
  path.join(__dirname, "../schema.graphql"),
  path.join(__dirname, "../client-directives.graphql"),
];
const mergedSchema = schemaFiles
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
fs.writeFileSync(
  path.join(__dirname, "../merged_schema.graphql"),
  mergedSchema
);

module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: "./src",
  language: "typescript", // "javascript" | "typescript" | "flow"
  schema: "../merged_schema.graphql",
  exclude: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
  // noFutureProofEnums: true,
  featureFlags: {
    enable_relay_resolver_transform: true,
  },
};

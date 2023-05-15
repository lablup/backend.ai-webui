// To get full GraphQL syntax highlighting and language support, install the GraphQL extension for VSCode.
// https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax
module.exports = {
  schema: [
    // To update graphql schema, run `./backend.ai mgr gql show` and copy the output to schema.graphql
    "./schema.graphql",
    // "./relay-directives.graphql",
    "./client-directives.graphql"
  ],
  documents: ["./src/**/*.{tsx,ts,jsx,js,graphql}"],
};
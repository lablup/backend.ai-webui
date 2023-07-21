module.exports = {
  schema: [
    // To update graphql schema, run `./backend.ai mgr gql show` and copy the output to schema.graphql
    "./react/data/schema.graphql",
    "./react/data/relay-directives.graphql",
  ],
  documents: ["./react/src/**/*.{graphql,ts,tsx}"],
};
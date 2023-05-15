export default function fullNameResolver(fragmentRef: fullNameResolver$key) {
  const data = readFragment(
    graphql`
      fragment fullNameResolver on ComputeSession {
        name
        id
      }
    `,
    fragmentRef
  );

  return [data.lastName, data.firstName].join(" ");
}

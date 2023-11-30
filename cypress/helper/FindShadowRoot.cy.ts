export const findShadowRoot = (routes) => {
  const segments = routes.split(">").map((route) => route.trim());
  let element = cy.get(segments[0]).shadow();
  for (const [idx,segment] of segments.entries()) {
    if (idx === 0) {
      continue
    } else {
      element = element.find(segment).shadow();
    }
  }
  return element;
};
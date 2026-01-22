import { base } from "./base.js";
import { react } from "./react.js";

export { base } from "./base.js";
export { react } from "./react.js";

export const reactConfig = [...base, ...react];

export default { base, react, reactConfig };

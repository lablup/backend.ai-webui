import { test } from "@e2e-dev/web";
import { credentials } from "e2e";
import { apiEndpoint, signIn } from "./utils/login";

test.setup(
  "sign in as admin",
  { sessions: ["admin"] },
  async ({ app, screen, session }) => {
    const admin = credentials.user("admin");
    await signIn(app, screen, admin.username, admin.password, apiEndpoint);
    await session.save("admin");
  },
);

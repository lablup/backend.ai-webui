import { test } from "@e2e-dev/web";
import { credentials } from "e2e";
import { signIn } from "./utils/login";

const apiEndpoint =
  process.env.E2E_WEBSERVER_ENDPOINT ?? "http://127.0.0.1:8090";

test.setup(
  "sign in as admin",
  { sessions: ["admin"] },
  async ({ app, screen, session }) => {
    await signIn(app, screen, credentials.user("admin"), apiEndpoint);
    await session.save("admin");
  },
);

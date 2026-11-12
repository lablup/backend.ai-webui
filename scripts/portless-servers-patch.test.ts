import http from "node:http";
import type { AddressInfo } from "node:net";
import { createProxyServer, type RouteInfo } from "portless";

const listen = (server: http.Server) =>
  new Promise<number>((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve((server.address() as AddressInfo).port),
    ),
  );

const close = (server: http.Server) =>
  new Promise((resolve) => server.close(resolve));

const get = (port: number, host: string, path: string) =>
  new Promise<{ status: number; type: string; body: string }>(
    (resolve, reject) => {
      http
        .get(
          { host: "127.0.0.1", port, path, headers: { host }, agent: false },
          (res) => {
            let body = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () =>
              resolve({
                status: res.statusCode ?? 0,
                type: String(res.headers["content-type"] ?? ""),
                body,
              }),
            );
          },
        )
        .on("error", reject);
    },
  );

describe("portless /servers patch", () => {
  let app: http.Server;
  let proxy: http.Server;
  let appPort: number;
  let proxyPort: number;
  const routes: RouteInfo[] = [];

  beforeAll(async () => {
    app = http.createServer((req, res) => res.end(`app:${req.url}`));
    appPort = await listen(app);
    routes.push({ hostname: "app.localhost", port: appPort, pid: 4242 });
    proxy = createProxyServer({
      getRoutes: () => routes,
      proxyPort: 0,
      onError: () => {},
    }) as http.Server;
    proxyPort = await listen(proxy);
  });

  afterAll(async () => {
    await close(proxy);
    await close(app);
  });

  it.each([
    ["localhost", "/servers"],
    ["localhost", "/servers/"],
    ["127.0.0.1", "/servers"],
    ["127.0.0.1", "/servers/?x=1"],
  ])("lists the routes as JSON for %s%s", async (host, path) => {
    const res = await get(proxyPort, `${host}:${proxyPort}`, path);
    expect(res.status).toBe(200);
    expect(res.type).toContain("application/json");
    expect(JSON.parse(res.body)).toEqual([
      {
        hostname: "app.localhost",
        port: appPort,
        pid: 4242,
        url: expect.stringMatching(/^http:\/\/app\.localhost(:\d+)?$/),
      },
    ]);
  });

  it("proxies a registered app's own /servers to the app", async () => {
    const res = await get(proxyPort, `app.localhost:${proxyPort}`, "/servers");
    expect(res.status).toBe(200);
    expect(res.body).toBe("app:/servers");
  });

  it("refuses /servers for a host that is not a portless name", async () => {
    const res = await get(proxyPort, "example.com", "/servers");
    expect(res.status).toBe(421);
  });

  it("keeps the 404 for other paths on an unregistered name", async () => {
    const res = await get(proxyPort, `nope.localhost:${proxyPort}`, "/x");
    expect(res.status).toBe(404);
  });
});

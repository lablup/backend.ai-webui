import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const DevConfig = require("./dev-config");

/**
 * Create a DevConfig instance isolated from the real .env.development.local.
 * The constructor calls loadEnvFile() which reads the real file,
 * so we override envFile to a nonexistent path before it loads.
 */
function createIsolatedConfig(): InstanceType<typeof DevConfig> {
  const config = new DevConfig();
  config.env = {};
  return config;
}

describe("DevConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.BAI_WEBUI_DEV_PORT_OFFSET;
    delete process.env.HOST;
    delete process.env.PORT;
    delete process.env.THEME_HEADER_COLOR;
    delete process.env.BAI_WEBUI_DEV_REACT_PORT;
    delete process.env.BAI_WEBUI_DEV_HOST;
    delete process.env.BAI_WEBUI_DEV_THEME_COLOR;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("default configuration", () => {
    it("should have default React port 9081", () => {
      const config = createIsolatedConfig();
      expect(config.basePorts.react).toBe(9081);
    });

    it("should not have webdev port", () => {
      const config = createIsolatedConfig();
      expect(config.basePorts).not.toHaveProperty("webdev");
    });

    it("should default host to localhost", () => {
      const config = createIsolatedConfig();
      expect(config.getHost()).toBe("localhost");
    });

    it("should default port offset to 0", () => {
      const config = createIsolatedConfig();
      expect(config.getPortOffset()).toBe(0);
    });
  });

  describe("getPorts", () => {
    it("should return only react port", () => {
      const config = createIsolatedConfig();
      const ports = config.getPorts();
      expect(ports).toEqual({ react: 9081 });
      expect(ports).not.toHaveProperty("webdev");
    });

    it("should apply port offset", () => {
      process.env.BAI_WEBUI_DEV_PORT_OFFSET = "10";
      const config = createIsolatedConfig();
      const ports = config.getPorts();
      expect(ports.react).toBe(9091);
    });

    it("should use PORT env variable when set (e.g., by Portless)", () => {
      process.env.PORT = "3456";
      const config = createIsolatedConfig();
      const ports = config.getPorts();
      expect(ports.react).toBe(3456);
    });

    it("should prefer PORT env over port offset", () => {
      process.env.PORT = "3456";
      process.env.BAI_WEBUI_DEV_PORT_OFFSET = "10";
      const config = createIsolatedConfig();
      const ports = config.getPorts();
      expect(ports.react).toBe(3456);
    });

    it("should read PORT from env file", () => {
      const config = createIsolatedConfig();
      config.env = { PORT: "4567" };
      const ports = config.getPorts();
      expect(ports.react).toBe(4567);
    });

    it("should ignore non-numeric PORT", () => {
      process.env.PORT = "abc";
      const config = createIsolatedConfig();
      const ports = config.getPorts();
      expect(ports.react).toBe(9081);
    });
  });

  describe("getPortOffset", () => {
    it("should read offset from process.env", () => {
      process.env.BAI_WEBUI_DEV_PORT_OFFSET = "5";
      const config = createIsolatedConfig();
      expect(config.getPortOffset()).toBe(5);
    });

    it("should read offset from env file", () => {
      const config = createIsolatedConfig();
      config.env = { BAI_WEBUI_DEV_PORT_OFFSET: "15" };
      expect(config.getPortOffset()).toBe(15);
    });

    it("should return 0 for non-numeric offset", () => {
      process.env.BAI_WEBUI_DEV_PORT_OFFSET = "abc";
      const config = createIsolatedConfig();
      expect(config.getPortOffset()).toBe(0);
    });
  });

  describe("getHost", () => {
    it("should read host from HOST env", () => {
      process.env.HOST = "192.168.1.100";
      const config = createIsolatedConfig();
      expect(config.getHost()).toBe("192.168.1.100");
    });

    it("should read host from env file", () => {
      const config = createIsolatedConfig();
      config.env = { HOST: "10.0.0.5" };
      expect(config.getHost()).toBe("10.0.0.5");
    });
  });

  describe("getThemeColor", () => {
    it("should return undefined when not set", () => {
      const config = createIsolatedConfig();
      expect(config.getThemeColor()).toBeUndefined();
    });

    it("should read from THEME_HEADER_COLOR env", () => {
      process.env.THEME_HEADER_COLOR = "#abcdef";
      const config = createIsolatedConfig();
      expect(config.getThemeColor()).toBe("#abcdef");
    });

    it("should read from env file", () => {
      const config = createIsolatedConfig();
      config.env = { THEME_HEADER_COLOR: "#123456" };
      expect(config.getThemeColor()).toBe("#123456");
    });
  });

  describe("generateConfig", () => {
    it("should return config without webdev references", () => {
      const config = createIsolatedConfig();
      const generated = config.generateConfig();
      expect(generated.ports).toEqual({ react: 9081 });
      expect(generated.host).toBe("localhost");
      expect(generated.offset).toBe(0);
    });
  });

  describe("setEnvironmentVariables", () => {
    it("should set BAI_WEBUI_DEV_REACT_PORT", () => {
      const config = createIsolatedConfig();
      config.setEnvironmentVariables();
      expect(process.env.BAI_WEBUI_DEV_REACT_PORT).toBe("9081");
    });

    it("should set BAI_WEBUI_DEV_HOST", () => {
      const config = createIsolatedConfig();
      config.setEnvironmentVariables();
      expect(process.env.BAI_WEBUI_DEV_HOST).toBe("localhost");
    });

    it("should not set BAI_WEBUI_DEV_WEBDEV_PORT", () => {
      const config = createIsolatedConfig();
      config.setEnvironmentVariables();
      expect(process.env.BAI_WEBUI_DEV_WEBDEV_PORT).toBeUndefined();
    });

    it("should set theme color when available", () => {
      process.env.THEME_HEADER_COLOR = "#ff0000";
      const config = createIsolatedConfig();
      config.setEnvironmentVariables();
      expect(process.env.BAI_WEBUI_DEV_THEME_COLOR).toBe("#ff0000");
    });

    it("should not set theme color when not available", () => {
      const config = createIsolatedConfig();
      delete process.env.BAI_WEBUI_DEV_THEME_COLOR;
      config.setEnvironmentVariables();
      expect(process.env.BAI_WEBUI_DEV_THEME_COLOR).toBeUndefined();
    });
  });

  describe("exportEnvironmentVariables", () => {
    it("should include BAI_WEBUI_DEV_REACT_PORT export", () => {
      const config = createIsolatedConfig();
      const output = config.exportEnvironmentVariables();
      expect(output).toContain("export BAI_WEBUI_DEV_REACT_PORT=9081");
    });

    it("should not include BAI_WEBUI_DEV_WEBDEV_PORT export", () => {
      const config = createIsolatedConfig();
      const output = config.exportEnvironmentVariables();
      expect(output).not.toContain("BAI_WEBUI_DEV_WEBDEV_PORT");
    });

    it("should not include BAI_WEBUI_DEV_PROXY export", () => {
      const config = createIsolatedConfig();
      const output = config.exportEnvironmentVariables();
      expect(output).not.toContain("BAI_WEBUI_DEV_PROXY");
    });

    it("should include host export", () => {
      const config = createIsolatedConfig();
      const output = config.exportEnvironmentVariables();
      expect(output).toContain("export BAI_WEBUI_DEV_HOST=localhost");
    });

    it("should include REACT_APP_THEME_COLOR when theme is set", () => {
      process.env.THEME_HEADER_COLOR = "#ff0000";
      const config = createIsolatedConfig();
      const output = config.exportEnvironmentVariables();
      expect(output).toContain('export REACT_APP_THEME_COLOR="#ff0000"');
    });

    it("should not include REACT_APP_THEME_COLOR when theme is not set", () => {
      const config = createIsolatedConfig();
      const output = config.exportEnvironmentVariables();
      expect(output).not.toContain("REACT_APP_THEME_COLOR=");
    });
  });

  describe("printConfig", () => {
    let consoleSpy: jest.SpiedFunction<typeof console.log>;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should print React port", () => {
      const config = createIsolatedConfig();
      config.printConfig();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("React: 9081")
      );
    });

    it("should not print WebDev port", () => {
      const config = createIsolatedConfig();
      config.printConfig();
      const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
      expect(allOutput).not.toContain("WebDev");
    });

    it("should print host", () => {
      const config = createIsolatedConfig();
      config.printConfig();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Host: localhost")
      );
    });

    it("should print port offset", () => {
      const config = createIsolatedConfig();
      config.printConfig();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Port Offset: +0")
      );
    });

    it("should print theme color when set", () => {
      process.env.THEME_HEADER_COLOR = "#1890ff";
      const config = createIsolatedConfig();
      config.printConfig();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("#1890ff")
      );
    });

    it("should not print theme color when not set", () => {
      const config = createIsolatedConfig();
      config.printConfig();
      const allOutput = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
      expect(allOutput).not.toContain("Theme Color");
    });
  });

  describe("loadEnvFile", () => {
    let tmpDir: string;
    let tmpEnvFile: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dev-config-test-"));
      tmpEnvFile = path.join(tmpDir, ".env.development.local");
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true });
    });

    it("should load values from env file", () => {
      fs.writeFileSync(
        tmpEnvFile,
        "BAI_WEBUI_DEV_PORT_OFFSET=20\nHOST=10.0.0.1\n"
      );
      const config = createIsolatedConfig();
      config.envFile = tmpEnvFile;
      config.loadEnvFile();
      expect(config.env.BAI_WEBUI_DEV_PORT_OFFSET).toBe("20");
      expect(config.env.HOST).toBe("10.0.0.1");
    });

    it("should handle missing env file gracefully", () => {
      const config = createIsolatedConfig();
      config.envFile = path.join(tmpDir, "nonexistent");
      config.loadEnvFile();
      expect(config.env).toEqual({});
    });

    it("should strip quotes from values", () => {
      fs.writeFileSync(tmpEnvFile, "HOST='myhost'\n");
      const config = createIsolatedConfig();
      config.envFile = tmpEnvFile;
      config.loadEnvFile();
      expect(config.env.HOST).toBe("myhost");
    });

    it("should skip empty lines", () => {
      fs.writeFileSync(tmpEnvFile, "HOST=myhost\n\n\nPORT=3000\n");
      const config = createIsolatedConfig();
      config.envFile = tmpEnvFile;
      config.loadEnvFile();
      expect(config.env.HOST).toBe("myhost");
    });
  });

  describe("CLI execution", () => {
    const scriptPath = path.resolve(__dirname, "dev-config.js");

    // CLI tests use a clean env without .env.development.local influence
    // by running in a temp directory where no env file exists
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dev-config-cli-"));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true });
    });

    it("should output shell exports with 'env' command", () => {
      const output = execFileSync("node", [scriptPath, "env"], {
        encoding: "utf8",
        cwd: tmpDir,
      });
      expect(output).toContain("export BAI_WEBUI_DEV_REACT_PORT=9081");
      expect(output).toContain("export BAI_WEBUI_DEV_HOST=localhost");
      expect(output).not.toContain("BAI_WEBUI_DEV_WEBDEV_PORT");
      expect(output).not.toContain("BAI_WEBUI_DEV_PROXY");
    });

    it("should print config with 'update' command", () => {
      const output = execFileSync("node", [scriptPath, "update"], {
        encoding: "utf8",
        cwd: tmpDir,
      });
      expect(output).toContain("Updating development configuration");
      expect(output).toContain("React: 9081");
      expect(output).not.toContain("WebDev");
    });

    it("should print config with 'show' command", () => {
      const output = execFileSync("node", [scriptPath, "show"], {
        encoding: "utf8",
        cwd: tmpDir,
      });
      expect(output).toContain("Backend.AI WebUI Development Configuration");
      expect(output).toContain("React: 9081");
    });

    it("should default to show when no command given", () => {
      const output = execFileSync("node", [scriptPath], {
        encoding: "utf8",
        cwd: tmpDir,
      });
      expect(output).toContain("Backend.AI WebUI Development Configuration");
    });

    it("should apply port offset from env", () => {
      const output = execFileSync("node", [scriptPath, "env"], {
        encoding: "utf8",
        cwd: tmpDir,
        env: { ...process.env, BAI_WEBUI_DEV_PORT_OFFSET: "10" },
      });
      expect(output).toContain("export BAI_WEBUI_DEV_REACT_PORT=9091");
    });
  });
});

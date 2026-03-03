#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { off } = require("process");

/**
 * Simplified development configuration for Backend.AI WebUI
 */
class DevConfig {
  constructor() {
    this.projectRoot = process.cwd();
    this.folderName = path.basename(this.projectRoot);
    this.envFile = path.join(this.projectRoot, ".env.development.local");

    // Load environment variables
    this.loadEnvFile();

    // Default ports
    this.basePorts = {
      react: 9081,
      webdev: 3081,
    };
  }

  loadEnvFile() {
    this.env = {};
    if (fs.existsSync(this.envFile)) {
      const envContent = fs.readFileSync(this.envFile, "utf8");
      envContent.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
          this.env[key.trim()] = value.trim().replace(/['\"]/g, "");
        }
      });
    }
  }

  getPortOffset() {
    const offset =
      process.env.BAI_WEBUI_DEV_PORT_OFFSET ||
      this.env.BAI_WEBUI_DEV_PORT_OFFSET;

    if (offset && !isNaN(offset)) {
      return parseInt(offset);
    }

    return 0;
  }

  getHost() {
    return process.env.HOST || this.env.HOST || "localhost";
  }

  getThemeColor() {
    return process.env.THEME_HEADER_COLOR || this.env.THEME_HEADER_COLOR;
  }

  getPorts() {
    const offset = this.getPortOffset();
    return {
      react: this.basePorts.react + offset,
      webdev: this.basePorts.webdev + offset,
    };
  }

  generateConfig() {
    const ports = this.getPorts();
    const host = this.getHost();
    const themeColor = this.getThemeColor();

    return {
      host,
      ports,
      themeColor,
      offset: this.getPortOffset(),
    };
  }

  setEnvironmentVariables() {
    const config = this.generateConfig();

    // Set environment variables for the current process
    process.env.BAI_WEBUI_DEV_REACT_PORT = config.ports.react.toString();
    process.env.BAI_WEBUI_DEV_WEBDEV_PORT = config.ports.webdev.toString();
    process.env.BAI_WEBUI_DEV_HOST = config.host;
    config.themeColor &&
      (process.env.BAI_WEBUI_DEV_THEME_COLOR = config.themeColor);

    return config;
  }

  exportEnvironmentVariables() {
    const config = this.generateConfig();

    // Generate shell export commands
    const exports = [
      `export BAI_WEBUI_DEV_REACT_PORT=${config.ports.react}`,
      `export BAI_WEBUI_DEV_WEBDEV_PORT=${config.ports.webdev}`,
      `export BAI_WEBUI_DEV_HOST=${config.host}`,
      `export BAI_WEBUI_DEV_THEME_COLOR="${config.themeColor}"`,
      config.themeColor &&
        `export REACT_APP_THEME_COLOR="${config.themeColor}"`,
      `export BAI_WEBUI_DEV_PROXY=http://${config.host}:${config.ports.webdev}`,
    ];

    return exports.join("\n");
  }

  printConfig() {
    const config = this.generateConfig();
    console.log(`\n🚀 Backend.AI WebUI Development Configuration`);
    console.log(`🌐 Host: ${config.host}`);
    // Print theme color with a colored block
    if (config.themeColor) {
      const colorBlock = `\x1b[48;2;${parseInt(config.themeColor.slice(1, 3), 16)};${parseInt(config.themeColor.slice(3, 5), 16)};${parseInt(config.themeColor.slice(5, 7), 16)}m  \x1b[0m`;
      console.log(`🎨 Theme Color: ${config.themeColor} ${colorBlock}`);
    }
    console.log(`📡 Ports`);
    console.log(`   React: ${config.ports.react}`);
    console.log(`   WebDev: ${config.ports.webdev}`);
    console.log(`🔢 Port Offset: +${config.offset}`);
    console.log("");
  }
}

// CLI Usage
if (require.main === module) {
  const devConfig = new DevConfig();
  const command = process.argv[2];

  switch (command) {
    case "env":
      // Output environment variables for shell sourcing
      console.log(devConfig.exportEnvironmentVariables());
      break;

    case "update":
      console.log("🔧 Updating development configuration...");
      devConfig.setEnvironmentVariables();
      devConfig.printConfig();
      break;

    case "show":
    default:
      devConfig.printConfig();
      break;
  }
}

module.exports = DevConfig;

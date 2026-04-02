#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const CONFIG_CONFIG_PATH = path.join(__dirname, "..", "config.toml");
const CONFIG_OUTPUT_PATH = path.join(
  __dirname,
  "../build/web",
  "config.toml",
);

console.log("🔄 Copying config.toml to build/web...");
fs.copyFileSync(CONFIG_CONFIG_PATH, CONFIG_OUTPUT_PATH);

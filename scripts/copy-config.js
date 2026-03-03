#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const TOML = require("@iarna/toml");

const CONFIG_SAMPLE_PATH = path.join(__dirname, "..", "config.toml.sample");
const CONFIG_CONFIG_PATH = path.join(__dirname, "..", "config.toml");
const CONFIG_OUTPUT_PATH = path.join(
  __dirname,
  "../build/web",
  "config.toml",
);
const BAI_CONFIGS_GENERAL = ["apiEndpoint", "apiEndpointText"];
const IS_VERCEL = process.env.VERCEL === "1" || process.env.VERCEL === "true";

function generateConfigToml() {
  try {
    // Read the sample config file
    if (!fs.existsSync(CONFIG_SAMPLE_PATH)) {
      throw new Error(`config.toml.sample not found at ${CONFIG_SAMPLE_PATH}`);
    }

    const configContent = fs.readFileSync(CONFIG_SAMPLE_PATH, "utf8");

    // Parse TOML content
    const config = TOML.parse(configContent);

    // Function to recursively remove empty properties and clear bracketed values
    const normalizeProps = (obj) => {
      if (typeof obj !== "object" || obj === null) return obj;

      for (const key of Object.keys(obj)) {
        // Replace bracketed values with empty strings
        if (
          typeof obj[key] === "string" &&
          obj[key].startsWith("[") &&
          obj[key].endsWith("]")
        ) {
          obj[key] = "";
        } else if (obj[key] === null || obj[key] === undefined) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
          normalizeProps(obj[key]);

          // Remove empty objects
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      }

      return obj;
    };

    // Remove empty properties from the config
    normalizeProps(config);

    // Update general properties with environment variables
    for (const key of BAI_CONFIGS_GENERAL) {
      const envValue = process.env[`BAI_CONFIG_GENERAL_${key.toUpperCase()}`];
      if (envValue) {
        config["general"][key] = envValue;

        console.log(
          `✓ Updated general.${key} with environment variable BAI_CONFIG_GENERAL_${key.toUpperCase()} with value: ${envValue}`,
        );
      }
    }

    // Convert back to TOML format
    const outputContent = TOML.stringify(config);

    // Write the updated config
    fs.writeFileSync(CONFIG_OUTPUT_PATH, outputContent, "utf8");
  } catch (error) {
    console.error("❌ Error building config.toml:", error.message);
    process.exit(1);
  }
}

if (IS_VERCEL) {
  console.log("🔄 Generating config.toml for Vercel deployment...");
  generateConfigToml();
} else {
  console.log("🔄 Copying config.toml to build/web...");
  fs.copyFileSync(CONFIG_CONFIG_PATH, CONFIG_OUTPUT_PATH);
}

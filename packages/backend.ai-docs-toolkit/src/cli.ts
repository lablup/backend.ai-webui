#!/usr/bin/env node

/**
 * docs-toolkit CLI
 *
 * Usage:
 *   docs-toolkit pdf [--lang all|en|ko|...] [--theme default]
 *   docs-toolkit preview [--mode sample|catalog|document] [--lang en] [--port 3456]
 *   docs-toolkit preview:html [--mode document|catalog] [--lang en] [--port 3457]
 *   docs-toolkit init
 *   docs-toolkit agents [--force]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadToolkitConfig, resolveConfig } from './config.js';
import type { ResolvedDocConfig, AgentConfig } from './config.js';

const COMMANDS = ['pdf', 'preview', 'preview:html', 'build:web', 'serve:web', 'init', 'agents', 'help'] as const;
type Command = (typeof COMMANDS)[number];

function printUsage(): void {
  console.log(`
docs-toolkit — Documentation toolkit for markdown → PDF/HTML

Usage:
  docs-toolkit <command> [options]

Commands:
  pdf            Generate PDF documents
  preview        PDF preview server (live-reload)
  preview:html   HTML preview server (live-reload, no PDF)
  build:web      Generate static multi-page website
  serve:web      Website dev server (live-reload)
  init           Initialize a new documentation project
  agents         Generate Claude AI agent files from templates
  help           Show this help message

Options:
  pdf:
    --lang <all|en|ko|...>    Language(s) to generate (default: all)
    --theme <name>            Theme name (default: default)

  preview:
    --mode <sample|catalog|document>  Preview mode (default: sample)
    --lang <en|ko|...>                Language (default: en)
    --port <number>                   Port number (default: 3456)
    --theme <name>                    Theme name (default: default)

  preview:html:
    --mode <document|catalog>  Preview mode (default: document)
    --lang <en|ko|...>         Language (default: en)
    --port <number>            Port number (default: 3457)

  build:web:
    --lang <all|en|ko|...>    Language(s) to generate (default: all)

  serve:web:
    --lang <en|ko|...>        Language (default: en)
    --port <number>            Port number (default: 3458)

  agents:
    --force                    Overwrite existing agent files

Examples:
  docs-toolkit pdf --lang all
  docs-toolkit pdf --lang en
  docs-toolkit preview
  docs-toolkit preview --mode document --lang ko
  docs-toolkit preview:html --lang en
  docs-toolkit build:web --lang all
  docs-toolkit build:web --lang en
  docs-toolkit serve:web --lang en
  docs-toolkit serve:web --lang ko --port 3459
  docs-toolkit init
  docs-toolkit agents
  docs-toolkit agents --force
`);
}

function getCommand(argv: string[]): Command | null {
  const cmd = argv[0];
  if (!cmd) return null;
  if (COMMANDS.includes(cmd as Command)) return cmd as Command;
  if (cmd === '--help' || cmd === '-h') return 'help';
  return null;
}

function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

// ── Init Command ────────────────────────────────────────────────

async function runInit(): Promise<void> {
  const projectRoot = process.cwd();
  const configFile = 'docs-toolkit.config.yaml';
  const configPath = path.join(projectRoot, configFile);

  if (fs.existsSync(configPath)) {
    console.log(`  ${configFile} already exists. Skipping init.`);
    console.log(`  To reinitialize, delete the file first.`);
    return;
  }

  // Create directories
  const dirs = ['src/en', 'src/en/images', 'assets'];
  for (const dir of dirs) {
    const dirPath = path.join(projectRoot, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  Created: ${dir}/`);
  }

  // Create config file
  const configContent = `# docs-toolkit configuration
# See: https://github.com/lablup/docs-toolkit

title: "My Documentation"
company: "My Company"

# Logo (SVG file relative to project root)
# logoPath: "assets/logo.svg"

# Source and output directories
srcDir: "src"
distDir: "dist"

# Version source (path to package.json, relative to project root)
versionSource: "./package.json"
# version: "1.0.0"  # Or set version explicitly

# Languages
languageLabels:
  en: "English"

# PDF settings
pdfFilenameTemplate: "{title}_{version}_{lang}.pdf"
pdfMetadata:
  author: "My Company"
  subject: "Documentation"
  creator: "docs-toolkit PDF Generator"

# Agent configuration (for 'docs-toolkit agents' command)
# agents:
#   projectTitle: "My Project"
#   docsRoot: "."
#   languages:
#     - code: en
#       label: English
#   terminologyFile: "TERMINOLOGY.md"
#   styleGuideFile: "DOCUMENTATION-STYLE-GUIDE.md"
`;

  fs.writeFileSync(configPath, configContent, 'utf-8');
  console.log(`  Created: ${configFile}`);

  // Create book.config.yaml
  const bookConfigPath = path.join(projectRoot, 'src', 'book.config.yaml');
  if (!fs.existsSync(bookConfigPath)) {
    const bookContent = `title: "My Documentation"
description: "Documentation project"
languages:
  - en
navigation:
  en:
    - title: "Getting Started"
      path: "quickstart.md"
`;
    fs.writeFileSync(bookConfigPath, bookContent, 'utf-8');
    console.log(`  Created: src/book.config.yaml`);
  }

  // Create sample quickstart.md
  const quickstartPath = path.join(projectRoot, 'src', 'en', 'quickstart.md');
  if (!fs.existsSync(quickstartPath)) {
    const quickstartContent = `# Getting Started

Welcome to your documentation project!

## Installation

Describe how to install your product here.

## Quick Start

1. Step one
2. Step two
3. Step three

:::tip
This is a helpful tip for your users.
:::
`;
    fs.writeFileSync(quickstartPath, quickstartContent, 'utf-8');
    console.log(`  Created: src/en/quickstart.md`);
  }

  console.log('');
  console.log('  Documentation project initialized!');
  console.log('');
  console.log('  Next steps:');
  console.log('    1. Edit docs-toolkit.config.yaml with your project settings');
  console.log('    2. Add markdown files to src/en/');
  console.log('    3. Update src/book.config.yaml with navigation');
  console.log('    4. Run: docs-toolkit pdf --lang en');
  console.log('');
}

// ── Agents Command ──────────────────────────────────────────────

async function runAgents(config: ResolvedDocConfig, force: boolean): Promise<void> {
  const agentConfig = config.agents;
  if (!agentConfig) {
    console.log('  No agent configuration found in docs-toolkit.config.yaml.');
    console.log('  Add an "agents" section to generate Claude agent files.');
    console.log('');
    console.log('  Example:');
    console.log('    agents:');
    console.log('      projectTitle: "My Project"');
    console.log('      docsRoot: "."');
    console.log('      languages:');
    console.log('        - code: en');
    console.log('          label: English');
    return;
  }

  // Dynamic import of Handlebars (only when needed)
  let Handlebars: typeof import('handlebars');
  try {
    const hbsModule = await import('handlebars');
    Handlebars = hbsModule.default as typeof import('handlebars');
  } catch {
    console.error('  Error: handlebars package is required for agent generation.');
    console.error('  Install it: pnpm add -D handlebars');
    process.exit(1);
  }

  const templatesDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..', 'templates',
  );

  if (!fs.existsSync(templatesDir)) {
    console.error(`  Templates directory not found: ${templatesDir}`);
    process.exit(1);
  }

  // Register Handlebars helpers
  Handlebars.registerHelper('join', (arr: unknown[], sep: string) => {
    if (!Array.isArray(arr)) return '';
    return arr.join(typeof sep === 'string' ? sep : ', ');
  });
  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  Handlebars.registerHelper('ifCond', function (this: unknown, v1: unknown, v2: unknown, options: Handlebars.HelperOptions) {
    return v1 === v2 ? options.fn(this) : options.inverse(this);
  });

  const templateData = {
    ...agentConfig,
    projectRoot: config.projectRoot,
    srcDir: config.srcDir,
    distDir: config.distDir,
    title: config.title,
  };

  // Process agent templates
  const agentTemplatesDir = path.join(templatesDir, 'agents');
  if (fs.existsSync(agentTemplatesDir)) {
    const outputDir = path.join(config.projectRoot, '.claude', 'agents');
    fs.mkdirSync(outputDir, { recursive: true });

    const templateFiles = fs.readdirSync(agentTemplatesDir).filter((f) => f.endsWith('.hbs'));
    for (const templateFile of templateFiles) {
      const outputName = templateFile.replace(/\.hbs$/, '');
      const outputPath = path.join(outputDir, outputName);

      if (fs.existsSync(outputPath) && !force) {
        console.log(`  Skipping (exists): .claude/agents/${outputName}`);
        continue;
      }

      const templateSrc = fs.readFileSync(path.join(agentTemplatesDir, templateFile), 'utf-8');
      const template = Handlebars.compile(templateSrc, { noEscape: true });
      const rendered = template(templateData);

      fs.writeFileSync(outputPath, rendered, 'utf-8');
      console.log(`  Generated: .claude/agents/${outputName}`);
    }
  }

  // Process CLAUDE.md template
  const claudeTemplatePath = path.join(templatesDir, 'CLAUDE.md.hbs');
  if (fs.existsSync(claudeTemplatePath)) {
    const outputPath = path.join(config.projectRoot, 'CLAUDE.md');

    if (fs.existsSync(outputPath) && !force) {
      console.log(`  Skipping (exists): CLAUDE.md`);
    } else {
      const templateSrc = fs.readFileSync(claudeTemplatePath, 'utf-8');
      const template = Handlebars.compile(templateSrc, { noEscape: true });
      const rendered = template(templateData);
      fs.writeFileSync(outputPath, rendered, 'utf-8');
      console.log(`  Generated: CLAUDE.md`);
    }
  }

  console.log('');
  console.log('  Agent files generated. You can customize them as needed.');
  if (!force) {
    console.log('  Use --force to overwrite existing files.');
  }
}

// ── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = getCommand(argv);

  if (!command || command === 'help') {
    printUsage();
    process.exit(command ? 0 : 1);
  }

  // Init doesn't need an existing config
  if (command === 'init') {
    await runInit();
    return;
  }

  // All other commands need a config
  const projectRoot = process.cwd();
  let config: ResolvedDocConfig;
  try {
    const toolkitConfig = loadToolkitConfig(projectRoot);
    config = resolveConfig(toolkitConfig);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  switch (command) {
    case 'pdf': {
      const { generatePdf } = await import('./generate-pdf.js');
      const langIdx = argv.indexOf('--lang');
      const themeIdx = argv.indexOf('--theme');
      await generatePdf(config, {
        lang: langIdx >= 0 ? argv[langIdx + 1] : 'all',
        theme: themeIdx >= 0 ? argv[themeIdx + 1] : 'default',
      });
      break;
    }

    case 'preview': {
      const { startPreviewServer } = await import('./preview-server.js');
      await startPreviewServer(config);
      break;
    }

    case 'preview:html': {
      const { startHtmlPreviewServer } = await import('./preview-server-web.js');
      await startHtmlPreviewServer(config);
      break;
    }

    case 'build:web': {
      const { generateWebsite } = await import('./website-generator.js');
      const langIdx = argv.indexOf('--lang');
      await generateWebsite(config, {
        lang: langIdx >= 0 ? argv[langIdx + 1] : 'all',
      });
      break;
    }

    case 'serve:web': {
      const { startWebsitePreviewServer } = await import('./preview-server-website.js');
      await startWebsitePreviewServer(config);
      break;
    }

    case 'agents': {
      const force = hasFlag(argv, '--force');
      await runAgents(config, force);
      break;
    }
  }
}

main().catch((err) => {
  console.error('docs-toolkit error:', err);
  process.exit(1);
});

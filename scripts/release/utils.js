#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Utility functions for release automation
 */

/**
 * Execute a shell command and return the output
 * @param {string} command - Command to execute
 * @param {object} options - Options for child_process.execSync
 * @returns {string} - Command output
 */
function execCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: ['inherit', 'pipe', 'pipe'],
      ...options 
    }).trim();
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Get all existing tags from the repository
 * @returns {string[]} - Array of tag names
 */
function getAllTags() {
  try {
    const output = execCommand('git tag -l');
    return output ? output.split('\n').filter(tag => tag.trim()) : [];
  } catch (error) {
    console.warn('No tags found or git command failed');
    return [];
  }
}

/**
 * Get the latest tag that matches a pattern
 * @param {string} pattern - Pattern to match (e.g., 'v25.15.*')
 * @returns {string|null} - Latest matching tag or null
 */
function getLatestTag(pattern = null) {
  const tags = getAllTags();
  
  if (!pattern) {
    // Return the latest tag by version
    return tags.length > 0 ? tags.sort(compareVersions).pop() : null;
  }
  
  const matchingTags = tags.filter(tag => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(tag);
  });
  
  return matchingTags.length > 0 ? matchingTags.sort(compareVersions).pop() : null;
}

/**
 * Compare two version strings (supports v prefix and PEP440-like versions)
 * @param {string} a - First version
 * @param {string} b - Second version
 * @returns {number} - Comparison result (-1, 0, 1)
 */
function compareVersions(a, b) {
  // Remove 'v' prefix if present
  const cleanA = a.replace(/^v/, '');
  const cleanB = b.replace(/^v/, '');
  
  // Split versions into parts
  const partsA = cleanA.split(/[.-]/).map(part => {
    const num = parseInt(part, 10);
    return isNaN(num) ? part : num;
  });
  const partsB = cleanB.split(/[.-]/).map(part => {
    const num = parseInt(part, 10);
    return isNaN(num) ? part : num;
  });
  
  const maxLength = Math.max(partsA.length, partsB.length);
  
  for (let i = 0; i < maxLength; i++) {
    const partA = partsA[i] ?? 0;
    const partB = partsB[i] ?? 0;
    
    if (typeof partA === 'number' && typeof partB === 'number') {
      if (partA < partB) return -1;
      if (partA > partB) return 1;
    } else {
      const strA = String(partA);
      const strB = String(partB);
      if (strA < strB) return -1;
      if (strA > strB) return 1;
    }
  }
  
  return 0;
}

/**
 * Parse a version string into components
 * @param {string} version - Version string (e.g., "25.15.2-rc.1")
 * @returns {object} - Parsed version components
 */
function parseVersion(version) {
  const cleanVersion = version.replace(/^v/, '');
  const match = cleanVersion.match(/^(\d+)\.(\d+)(?:\.(\d+))?(?:-?(alpha|beta|rc)(?:\.(\d+))?)?$/);
  
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3] || '0', 10),
    prerelease: match[4] || null,
    prereleaseNumber: parseInt(match[5] || '0', 10),
    original: version
  };
}

/**
 * Build a version string from components
 * @param {object} components - Version components
 * @returns {string} - Version string
 */
function buildVersion(components) {
  let version = `${components.major}.${components.minor}.${components.patch}`;
  
  if (components.prerelease) {
    version += `-${components.prerelease}`;
    if (components.prereleaseNumber > 0) {
      version += `.${components.prereleaseNumber}`;
    }
  }
  
  return version;
}

/**
 * Check if the current branch exists locally
 * @param {string} branchName - Branch name to check
 * @returns {boolean} - True if branch exists
 */
function branchExists(branchName) {
  try {
    execCommand(`git rev-parse --verify ${branchName}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the current branch exists on remote
 * @param {string} branchName - Branch name to check
 * @param {string} remote - Remote name (default: 'origin')
 * @returns {boolean} - True if branch exists on remote
 */
function remoteBranchExists(branchName, remote = 'origin') {
  try {
    execCommand(`git ls-remote --heads ${remote} ${branchName}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current package.json version
 * @returns {string} - Current version from package.json
 */
function getCurrentVersion() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

/**
 * Update package.json version
 * @param {string} newVersion - New version to set
 */
function updatePackageVersion(newVersion) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * Check if we're on the main branch
 * @returns {boolean} - True if on main branch
 */
function isOnMainBranch() {
  const currentBranch = execCommand('git branch --show-current');
  return currentBranch === 'main';
}

/**
 * Check if working directory is clean
 * @returns {boolean} - True if no uncommitted changes
 */
function isWorkingDirectoryClean() {
  try {
    const status = execCommand('git status --porcelain');
    return status.length === 0;
  } catch {
    return false;
  }
}

module.exports = {
  execCommand,
  getAllTags,
  getLatestTag,
  compareVersions,
  parseVersion,
  buildVersion,
  branchExists,
  remoteBranchExists,
  getCurrentVersion,
  updatePackageVersion,
  isOnMainBranch,
  isWorkingDirectoryClean
};
#!/usr/bin/env node

const { execCommand } = require('./utils');
const fs = require('fs');
const path = require('path');

/**
 * Generate release notes from git commits and PR information
 */

/**
 * Get commits between two tags/refs
 * @param {string} fromRef - Starting reference (tag or commit)
 * @param {string} toRef - Ending reference (tag or commit)
 * @returns {Array} - Array of commit objects
 */
function getCommitsBetween(fromRef, toRef = 'HEAD') {
  const command = `git log ${fromRef}..${toRef} --pretty=format:"%H|%s|%an|%ae|%ad" --date=short`;
  
  try {
    const output = execCommand(command);
    if (!output) return [];
    
    return output.split('\n').map(line => {
      const [hash, subject, author, email, date] = line.split('|');
      return { hash, subject, author, email, date };
    });
  } catch (error) {
    console.warn(`Failed to get commits between ${fromRef} and ${toRef}:`, error.message);
    return [];
  }
}

/**
 * Parse commit subject to extract PR number and type
 * @param {string} subject - Commit subject line
 * @returns {object} - Parsed commit information
 */
function parseCommitSubject(subject) {
  // Match patterns like "feat(FR-1234): description (#1234)"
  const prMatch = subject.match(/\(#(\d+)\)$/);
  const prNumber = prMatch ? prMatch[1] : null;
  
  // Extract type (feat, fix, etc.)
  const typeMatch = subject.match(/^(feat|fix|refactor|chore|docs|style|test|perf|build|ci|revert|hotfix|i18n|misc)(\([^)]+\))?: (.+)/);
  let type = 'misc';
  let description = subject;
  let scope = null;
  
  if (typeMatch) {
    type = typeMatch[1];
    scope = typeMatch[2] ? typeMatch[2].slice(1, -1) : null; // Remove parentheses
    description = typeMatch[3].replace(/\s*\(#\d+\)$/, ''); // Remove PR number from description
  }
  
  // Extract FR number from scope or description
  const frMatch = (scope || description).match(/FR-(\d+)/);
  const frNumber = frMatch ? frMatch[1] : null;
  
  return {
    type,
    scope,
    description,
    prNumber,
    frNumber,
    original: subject
  };
}

/**
 * Categorize commits by type
 * @param {Array} commits - Array of commit objects
 * @returns {object} - Categorized commits
 */
function categorizeCommits(commits) {
  const categories = {
    'feat': { title: '✨ Features', commits: [] },
    'fix': { title: '🐛 Bug Fixes', commits: [] },
    'refactor': { title: '🔨 Refactoring', commits: [] },
    'chore': { title: '🛠 Chores', commits: [] },
    'i18n': { title: '🌐 i18n', commits: [] },
    'test': { title: '🧪 E2E Tests', commits: [] },
    'style': { title: '🎨 Style', commits: [] },
    'hotfix': { title: '🚑 Hotfix', commits: [] },
    'docs': { title: '📝 Documentation', commits: [] },
    'perf': { title: '⚡ Performance', commits: [] },
    'misc': { title: '🔧 Miscellaneous', commits: [] }
  };
  
  const contributors = new Set();
  
  commits.forEach(commit => {
    const parsed = parseCommitSubject(commit.subject);
    const category = categories[parsed.type] || categories['misc'];
    
    category.commits.push({
      ...commit,
      ...parsed
    });
    
    contributors.add(commit.author);
  });
  
  // Filter out empty categories
  const filteredCategories = Object.entries(categories)
    .filter(([key, category]) => category.commits.length > 0)
    .reduce((acc, [key, category]) => {
      acc[key] = category;
      return acc;
    }, {});
  
  return {
    categories: filteredCategories,
    contributors: Array.from(contributors)
  };
}

/**
 * Format commits into markdown release notes
 * @param {object} categorizedCommits - Categorized commits object
 * @param {object} options - Formatting options
 * @returns {string} - Formatted markdown
 */
function formatReleaseNotes(categorizedCommits, options = {}) {
  const { categories, contributors } = categorizedCommits;
  const { version, previousVersion, includeContributors = true } = options;
  
  let markdown = '';
  
  // Header
  if (version) {
    markdown += `# Release ${version}\n\n`;
  }
  
  if (previousVersion) {
    markdown += `**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/${previousVersion}...v${version}\n\n`;
  }
  
  // Categories
  Object.entries(categories).forEach(([type, category]) => {
    markdown += `## ${category.title}\n\n`;
    
    category.commits.forEach(commit => {
      let line = `- ${commit.description}`;
      
      // Add FR number if available
      if (commit.frNumber) {
        line += ` **FR-${commit.frNumber}**`;
      }
      
      // Add author
      line += ` by @${commit.author}`;
      
      // Add PR link if available
      if (commit.prNumber) {
        line += ` [#${commit.prNumber}](https://github.com/lablup/backend.ai-webui/pull/${commit.prNumber})`;
      }
      
      markdown += `${line}\n`;
    });
    
    markdown += '\n';
  });
  
  // Contributors section
  if (includeContributors && contributors.length > 0) {
    markdown += '## 🙌 New Contributors\n\n';
    contributors.forEach(contributor => {
      markdown += `- @${contributor}\n`;
    });
    markdown += '\n';
  }
  
  return markdown.trim();
}

/**
 * Generate release notes for a version
 * @param {object} options - Generation options
 * @returns {string} - Generated release notes
 */
function generateReleaseNotes({ fromTag, toRef = 'HEAD', version, includeContributors = true }) {
  console.log(`🎨 Generating release notes from ${fromTag} to ${toRef}...`);
  
  if (!fromTag) {
    throw new Error('fromTag is required for release notes generation');
  }
  
  // Get commits between tags
  const commits = getCommitsBetween(fromTag, toRef);
  console.log(`Found ${commits.length} commits`);
  
  if (commits.length === 0) {
    return `# Release ${version || 'Unknown'}\n\nNo changes in this release.`;
  }
  
  // Categorize commits
  const categorizedCommits = categorizeCommits(commits);
  console.log(`Found ${Object.keys(categorizedCommits.categories).length} categories`);
  console.log(`Contributors: ${categorizedCommits.contributors.length}`);
  
  // Format as markdown
  const releaseNotes = formatReleaseNotes(categorizedCommits, {
    version,
    previousVersion: fromTag,
    includeContributors
  });
  
  return releaseNotes;
}

/**
 * Find the previous tag for release notes generation
 * @param {string} currentTag - Current tag to find previous for
 * @returns {string|null} - Previous tag or null
 */
function findPreviousTag(currentTag) {
  try {
    const command = `git tag -l --sort=-version:refname`;
    const allTags = execCommand(command).split('\n').filter(tag => tag.trim());
    
    const currentIndex = allTags.indexOf(currentTag);
    if (currentIndex > 0) {
      return allTags[currentIndex + 1];
    }
    
    // If we can't find the current tag, get the latest tag
    return allTags.length > 0 ? allTags[0] : null;
  } catch (error) {
    console.warn('Failed to find previous tag:', error.message);
    return null;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node generate-notes.js <fromTag> [toRef] [version]');
    console.log('  fromTag: Starting tag for changelog generation');
    console.log('  toRef: Ending reference (default: HEAD)');
    console.log('  version: Version for the release notes header');
    process.exit(1);
  }
  
  try {
    const [fromTag, toRef = 'HEAD', version] = args;
    const releaseNotes = generateReleaseNotes({ 
      fromTag, 
      toRef, 
      version,
      includeContributors: true 
    });
    
    console.log('\n📝 Generated release notes:\n');
    console.log(releaseNotes);
    
    // Save to file if version is provided
    if (version) {
      const filename = `/tmp/release-notes-${version}.md`;
      fs.writeFileSync(filename, releaseNotes);
      console.log(`\n💾 Saved to ${filename}`);
    }
  } catch (error) {
    console.error('❌ Release notes generation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  generateReleaseNotes,
  getCommitsBetween,
  parseCommitSubject,
  categorizeCommits,
  formatReleaseNotes,
  findPreviousTag
};
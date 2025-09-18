#!/usr/bin/env node

const {
  getAllTags,
  getLatestTag,
  parseVersion,
  buildVersion,
  getCurrentVersion,
  compareVersions
} = require('./utils');

/**
 * Version planning logic for release automation
 * Determines the next version based on release type and existing tags
 */

/**
 * Plan the next version based on release type and parameters
 * @param {object} options - Planning options
 * @param {string} options.releaseType - Type of release: minor|patch|rc|final
 * @param {string} [options.baseMinor] - Base minor version for minor/rc releases (e.g., "25.15")
 * @param {string} [options.forceVersion] - Force a specific version
 * @returns {object} - Release plan with version, branch, and metadata
 */
function plan({ releaseType, baseMinor, forceVersion }) {
  console.log('🎯 Planning release...');
  console.log(`Release type: ${releaseType}`);
  if (baseMinor) console.log(`Base minor: ${baseMinor}`);
  if (forceVersion) console.log(`Force version: ${forceVersion}`);

  // If force version is specified, use it directly
  if (forceVersion) {
    try {
      const parsedVersion = parseVersion(forceVersion);
      const branchName = `${parsedVersion.major}.${parsedVersion.minor}`;
      
      return {
        version: forceVersion,
        tag: `v${forceVersion}`,
        branch: branchName,
        needsNewBranch: releaseType === 'minor',
        isPrerelease: parsedVersion.prerelease !== null,
        releaseType: 'forced'
      };
    } catch (error) {
      throw new Error(`Invalid force version format: ${forceVersion}`);
    }
  }

  const currentVersion = getCurrentVersion();
  const allTags = getAllTags();
  const latestTag = getLatestTag();

  console.log(`Current package.json version: ${currentVersion}`);
  console.log(`Latest git tag: ${latestTag || 'none'}`);
  console.log(`Total tags found: ${allTags.length}`);

  switch (releaseType) {
    case 'minor':
      return planMinorRelease(baseMinor, allTags);
    
    case 'patch':
      return planPatchRelease(baseMinor, allTags);
    
    case 'rc':
      return planRcRelease(baseMinor, allTags);
    
    case 'final':
      return planFinalRelease(baseMinor, allTags);
    
    default:
      throw new Error(`Unknown release type: ${releaseType}`);
  }
}

/**
 * Plan a minor release (e.g., 25.15.0)
 */
function planMinorRelease(baseMinor, allTags) {
  if (!baseMinor) {
    throw new Error('baseMinor is required for minor releases (e.g., "25.15")');
  }

  const [major, minor] = baseMinor.split('.').map(Number);
  if (isNaN(major) || isNaN(minor)) {
    throw new Error(`Invalid baseMinor format: ${baseMinor}. Expected format: "25.15"`);
  }

  const version = `${major}.${minor}.0`;
  const tag = `v${version}`;
  const branchName = baseMinor;

  // Check if this version already exists
  if (allTags.includes(tag)) {
    throw new Error(`Version ${version} already exists as tag ${tag}`);
  }

  return {
    version,
    tag,
    branch: branchName,
    needsNewBranch: true,
    isPrerelease: false,
    releaseType: 'minor'
  };
}

/**
 * Plan a patch release (increment patch version on existing branch)
 */
function planPatchRelease(baseMinor, allTags) {
  if (!baseMinor) {
    throw new Error('baseMinor is required for patch releases (e.g., "25.15")');
  }

  const [major, minor] = baseMinor.split('.').map(Number);
  if (isNaN(major) || isNaN(minor)) {
    throw new Error(`Invalid baseMinor format: ${baseMinor}. Expected format: "25.15"`);
  }

  // Find the latest patch version for this minor version
  const pattern = `v${major}\\.${minor}\\.\\d+$`;
  const matchingTags = allTags.filter(tag => {
    const regex = new RegExp(pattern);
    return regex.test(tag) && !tag.includes('-'); // Exclude prereleases
  });

  let nextPatch = 0;
  if (matchingTags.length > 0) {
    const latestPatchTag = matchingTags.sort(compareVersions).pop();
    const latestVersion = parseVersion(latestPatchTag);
    nextPatch = latestVersion.patch + 1;
  }

  const version = `${major}.${minor}.${nextPatch}`;
  const tag = `v${version}`;
  const branchName = baseMinor;

  return {
    version,
    tag,
    branch: branchName,
    needsNewBranch: false,
    isPrerelease: false,
    releaseType: 'patch'
  };
}

/**
 * Plan an RC release
 */
function planRcRelease(baseMinor, allTags) {
  if (!baseMinor) {
    throw new Error('baseMinor is required for RC releases (e.g., "25.15")');
  }

  const [major, minor] = baseMinor.split('.').map(Number);
  if (isNaN(major) || isNaN(minor)) {
    throw new Error(`Invalid baseMinor format: ${baseMinor}. Expected format: "25.15"`);
  }

  // Find existing RC versions for this minor version
  const pattern = `v${major}\\.${minor}\\.\\d+-rc\\.\\d+$`;
  const rcTags = allTags.filter(tag => {
    const regex = new RegExp(pattern);
    return regex.test(tag);
  });

  let rcNumber = 1;
  let patchVersion = 0;

  if (rcTags.length > 0) {
    const latestRcTag = rcTags.sort(compareVersions).pop();
    const latestRc = parseVersion(latestRcTag);
    rcNumber = latestRc.prereleaseNumber + 1;
    patchVersion = latestRc.patch;
  } else {
    // Check if there are any stable releases for this minor version
    const stablePattern = `v${major}\\.${minor}\\.\\d+$`;
    const stableTags = allTags.filter(tag => {
      const regex = new RegExp(stablePattern);
      return regex.test(tag);
    });

    if (stableTags.length > 0) {
      const latestStableTag = stableTags.sort(compareVersions).pop();
      const latestStable = parseVersion(latestStableTag);
      patchVersion = latestStable.patch + 1;
    }
  }

  const version = `${major}.${minor}.${patchVersion}-rc.${rcNumber}`;
  const tag = `v${version}`;
  const branchName = baseMinor;

  return {
    version,
    tag,
    branch: branchName,
    needsNewBranch: false,
    isPrerelease: true,
    releaseType: 'rc'
  };
}

/**
 * Plan a final release (promote RC to stable)
 */
function planFinalRelease(baseMinor, allTags) {
  if (!baseMinor) {
    throw new Error('baseMinor is required for final releases (e.g., "25.15")');
  }

  const [major, minor] = baseMinor.split('.').map(Number);
  if (isNaN(major) || isNaN(minor)) {
    throw new Error(`Invalid baseMinor format: ${baseMinor}. Expected format: "25.15"`);
  }

  // Find the latest RC for this minor version
  const rcPattern = `v${major}\\.${minor}\\.\\d+-rc\\.\\d+$`;
  const rcTags = allTags.filter(tag => {
    const regex = new RegExp(rcPattern);
    return regex.test(tag);
  });

  if (rcTags.length === 0) {
    throw new Error(`No RC versions found for ${baseMinor}. Create an RC first.`);
  }

  const latestRcTag = rcTags.sort(compareVersions).pop();
  const latestRc = parseVersion(latestRcTag);

  // Remove prerelease suffix to create final version
  const version = `${latestRc.major}.${latestRc.minor}.${latestRc.patch}`;
  const tag = `v${version}`;
  const branchName = baseMinor;

  // Check if final version already exists
  if (allTags.includes(tag)) {
    throw new Error(`Final version ${version} already exists as tag ${tag}`);
  }

  return {
    version,
    tag,
    branch: branchName,
    needsNewBranch: false,
    isPrerelease: false,
    releaseType: 'final',
    promotedFrom: latestRcTag
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node plan.js <releaseType> [baseMinor] [forceVersion]');
    console.log('  releaseType: minor|patch|rc|final');
    console.log('  baseMinor: e.g., "25.15" (required for minor/patch/rc/final)');
    console.log('  forceVersion: e.g., "25.15.3" (optional)');
    process.exit(1);
  }

  try {
    const [releaseType, baseMinor, forceVersion] = args;
    const result = plan({ releaseType, baseMinor, forceVersion });
    
    console.log('\n✅ Release plan:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Planning failed:');
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { plan };
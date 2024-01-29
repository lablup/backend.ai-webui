export function normalizePEP440Version(version: string) {
  // Replace -, _, and whitespace with .
  let normalizedVersion = version.replace(/[-_\s]/g, '.');

  // Ensure that dev, a, b, rc, post are followed by . if directly followed by a digit
  normalizedVersion = normalizedVersion.replace(
    /(\.?)(dev|a|b|c|rc|post)(?=\d+)/g,
    '$1.$2.',
  );
  normalizedVersion = normalizedVersion.replace(/\.+/g, '.');

  return normalizedVersion;
}

function comparePEP440LocalVersions(
  localVersion1: string,
  localVersion2: string,
) {
  // If one or both local versions are undefined, they are considered equal
  if (localVersion1 === localVersion2) {
    return 0;
  } else if (localVersion1 === undefined && localVersion2 !== undefined) {
    return -1;
  } else if (localVersion1 !== undefined && localVersion2 === undefined) {
    return 1;
  }

  // Split local version into parts
  const parts1 = localVersion1.split('.');
  const parts2 = localVersion2.split('.');

  // Compare each part of the local version
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || '';
    const part2 = parts2[i] || '';

    if (/^\d+$/.test(part1) && /^\d+$/.test(part2)) {
      const diff = parseInt(part1, 10) - parseInt(part2, 10);
      if (diff !== 0) {
        return diff < 0 ? -1 : 1;
      }
    } else if (/^\d+$/.test(part1) && !/^\d+$/.test(part2)) {
      return 1;
    } else if (!/^\d+$/.test(part1) && /^\d+$/.test(part2)) {
      return -1;
    } else {
      const diff = part1.localeCompare(part2, undefined, {
        sensitivity: 'base',
      });
      if (diff !== 0) {
        return diff < 0 ? -1 : 1;
      }
    }
  }
  // If all parts are equal, the local versions are the same
  return 0;
}

export function comparePEP440Versions(version1: string, version2: string) {
  // Normalize versions
  const normalizedVersion1 = normalizePEP440Version(version1);
  const normalizedVersion2 = normalizePEP440Version(version2);

  // Split version into public and local parts
  const [publicVersion1, localVersion1] = normalizedVersion1.split('+');
  const [publicVersion2, localVersion2] = normalizedVersion2.split('+');

  // Split version into parts
  const parts1 = publicVersion1.split('.');
  const parts2 = publicVersion2.split('.');

  const suffixes = ['dev', 'a', 'b', 'c', 'rc', undefined, 'post'];
  // Compare each part of the version
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i];
    const part2 = parts2[i];

    if (part1 === '*' || part2 === '*') {
      return 0;
    } else if (/^\d+$/.test(part1) && /^\d+$/.test(part2)) {
      const diff = parseInt(part1, 10) - parseInt(part2, 10);
      if (diff !== 0) {
        return diff < 0 ? -1 : 1;
      }
    } else if (!/^\d+$/.test(part1) && /^\d+$/.test(part2)) {
      return -1;
    } else if (/^\d+$/.test(part1) && !/^\d+$/.test(part2)) {
      return 1;
    } else {
      const suffix1 = suffixes.indexOf(part1);
      const suffix2 = suffixes.indexOf(part2);
      if (suffix1 !== suffix2) {
        return suffix1 < suffix2 ? -1 : 1;
      }
    }
  }
  // If public versions are equal, compare local versions
  return comparePEP440LocalVersions(localVersion1, localVersion2);
}

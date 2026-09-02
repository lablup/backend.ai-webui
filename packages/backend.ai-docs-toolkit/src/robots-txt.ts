/**
 * robots.txt builder (F2 / FR-2714).
 *
 * Trivial pure function. Isolated in its own module so it can be
 * unit-tested without dragging in the website generator.
 *
 * F2's policy: documentation should be indexed by all crawlers. We
 * emit `User-agent: *` + empty `Disallow:` (which means "allow
 * everything" per the standard) and a `Sitemap:` reference when the
 * sitemap URL is known.
 */

export interface BuildRobotsTxtOptions {
  /**
   * Absolute URL of the sitemap, e.g. `https://docs.backend.ai/sitemap.xml`.
   * When omitted, no `Sitemap:` line is emitted (the rest of the file
   * still renders correctly — `Sitemap:` is optional per the de facto
   * standard).
   */
  sitemapUrl?: string;
}

/**
 * Build a robots.txt body. Returns the complete file content as a
 * UTF-8 string with a trailing newline.
 */
export function buildRobotsTxt(opts: BuildRobotsTxtOptions = {}): string {
  const lines: string[] = ["User-agent: *", "Disallow:"];
  if (opts.sitemapUrl) {
    lines.push("");
    lines.push(`Sitemap: ${opts.sitemapUrl}`);
  }
  return lines.join("\n") + "\n";
}

/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DOMPurify } from 'dompurify';
import React, { Suspense, use } from 'react';

export interface SanitizedHtmlProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'dangerouslySetInnerHTML'
> {
  html: string;
}

// dompurify loads on first use, not in the boot bundle.
let purifyPromise: Promise<DOMPurify> | undefined;
const loadPurify = () =>
  (purifyPromise ??= import('dompurify').then((m) => m.default));

const SanitizedHtmlContent: React.FC<SanitizedHtmlProps> = ({
  html,
  ...props
}) => {
  'use memo';
  const purify = use(loadPurify());
  return (
    <div
      {...props}
      dangerouslySetInnerHTML={{ __html: purify.sanitize(html) }}
    />
  );
};

/** A `<div>` holding `html` after `DOMPurify.sanitize` (default config). */
const SanitizedHtml: React.FC<SanitizedHtmlProps> = ({ html, ...props }) => {
  'use memo';
  return (
    <Suspense fallback={<div {...props} />}>
      <SanitizedHtmlContent html={html} {...props} />
    </Suspense>
  );
};

export default SanitizedHtml;

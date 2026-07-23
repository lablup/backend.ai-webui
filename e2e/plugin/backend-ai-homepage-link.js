/* global document, MutationObserver */
/**
 * E2E fixture for the login-screen homepage-link plugin.
 *
 * Served via `page.route` in `login-plugin.spec.ts`. Pure side-effect ES
 * module — IIFE that finds the login form in DOM and appends a "Visit
 * backend.ai" link. No exports.
 */
(function () {
  'use strict';

  const LINK_CLASS = 'bai-homepage-link';
  const HREF = 'https://www.backend.ai/';
  const LABEL = 'Visit backend.ai';

  function inject() {
    const form =
      document.querySelector('.ant-modal-content form') ||
      document.querySelector('.ant-modal-body form') ||
      document.querySelector('form.ant-form') ||
      document.querySelector('form');
    if (!form) return false;
    if (form.querySelector('.' + LINK_CLASS)) return true;

    const wrapper = document.createElement('div');
    wrapper.className = LINK_CLASS;
    wrapper.style.textAlign = 'center';
    wrapper.style.marginTop = '8px';
    wrapper.style.fontSize = '13px';

    const link = document.createElement('a');
    link.href = HREF;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = LABEL;

    wrapper.appendChild(link);
    form.appendChild(wrapper);
    return true;
  }

  if (inject()) return;

  const observer = new MutationObserver(() => {
    if (inject()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

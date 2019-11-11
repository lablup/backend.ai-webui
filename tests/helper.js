import {Selector} from 'testcafe';


export const ShadowSelector = Selector(
    (selector, element=document, separator='>') => {
      const segments = selector.split(separator).map((s) => s.trim());
      for (const [idx, segment] of segments.entries()) {
        element = element.querySelector(segment);
        if (!element) return null;
        if (idx + 1 === segments.length) break;
        if (!!element.shadowRoot) element = element.shadowRoot;
      }
      return element;
    });

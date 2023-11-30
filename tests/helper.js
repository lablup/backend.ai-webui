import {ClientFunction, Selector} from 'testcafe';


export const ShadowSelector = Selector(
    (selector, element=document, separator='>') => {
      const segments = selector.split(separator).map((s) => s.trim());
      for (const [idx, segment] of segments.entries()) {
        element = element.querySelector(segment);
        if (!element) {
          return null
        } else {
          element = element.shadowRoot
        };
      }
      return element;
    });

export const generateRandomString = (length=6, chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

class _JSActions {
  constructor() {
    // Some buttons are not clickable by TestCafe's click.
    this.click = ClientFunction((elm) => {
      elm().click();
      return true;
    });
  }
}
export const JSAction = new _JSActions();

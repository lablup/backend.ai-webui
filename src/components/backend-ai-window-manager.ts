import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@material/mwc-icon-button';
import BackendAIWindow from './backend-ai-window';
/**
 Backend AI Window

 @group Backend.AI Web UI
 @element backend-ai-window
 */

@customElement('backend-ai-window-manager')
export default class BackendAIWindowManager extends LitElement {
  @property({type: Object}) windows : Record<string, BackendAIWindow> = {};

  addWindow(win: BackendAIWindow) {
    if(!Object.keys(this.windows).includes(win.name)) {
      this.windows[win.name] = win;
    }
    console.log(this.windows);
  }

  removeWindow(win: BackendAIWindow) {
    if(Object.keys(this.windows).includes(win.name)) {
      delete this.windows[win.name];
    }
  }
}


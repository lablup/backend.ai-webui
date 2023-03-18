/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import { css, CSSResultGroup, html } from "lit";
import { BackendAIPage } from "./backend-ai-page";
import { customElement, property } from "lit/decorators.js";

import { BackendAiStyles } from "./backend-ai-general-styles";
import {
  IronFlex,
  IronFlexAlignment,
} from "../plastics/layout/iron-flex-layout-classes";

/**
 Backend.AI React Test View

 @group Backend.AI Web UI
 @element backend-ai-react-test-view
 */
@customElement("backend-ai-react-test-view")
export default class BackendAiReactTestView extends BackendAIPage {
  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      // language=CSS
      css`
        .box {
          color: black;
        }
      `,
    ];
  }
  firstUpdated() {}
  @property()
  value: string = "Hello";

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      return;
    }
  }
  changeName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
  }

  handleChangeInReact = (event: CustomEvent) => {
    if (event.type === "my") {
      console.log("This log from lit(react-test-view)", event);
      this.value = event.detail.value;
    }
  };

  render() {
    //@ts-ignore
    // const sharedCSS = BackendAiReactTestView.styles
    //   .flat()
    //   .map((s) => s.cssText)
    //   .join("\n");

    // language=HTML
    return html`
      <div class="box">
        <h1>Lit</h1>
        <input
          @input=${this.changeName}
          placeholder="Enter something. you can see the changes on react and lit."
        />
        <p>Value: ${this.value}</p>
      </div>

      <backend-ai-webui-react-example
        value=${this.value}
        @my=${this.value === "none" ? null : this.handleChangeInReact}
      >
        <div slot="hello">
          <h1>I'm children</h1>
        </div>
      </backend-ai-webui-react-example>
      <!-- <backend-ai-react-test-internal-view></backend-ai-react-test-internal-view> -->
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-react-test-view": BackendAiReactTestView;
  }
}

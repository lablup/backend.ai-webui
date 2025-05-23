import { PaperColor } from './paper-color';
import { css } from 'lit';

export const BackendAiStyles = [
  PaperColor,
  // language=CSS
  css`
    :host > *,
    html {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      --general-menu-background-color: transparent;
      --general-menu-background-color-less: rgba(255, 255, 255, 0.6);
      --general-menu-background-border: var(
        --token-colorBorder,
        rgba(23, 23, 23, 1)
      );
      --general-menu-background-opacity: 1;
      --general-menu-color-2: #242424;
      --general-menu-color: #efefef;
      --general-navbar-footer-background-color-r: 255;
      --general-navbar-footer-background-color-g: 255;
      --general-navbar-footer-background-color-b: 255;
      --general-navbar-footer-background-color: #2a2c30;
      --general-navbar-footer-background-color-less: rgba(255, 255, 255, 0.6);
      --general-navbar-footer-background-border: var(
        --token-colorBorder,
        rgba(23, 23, 23, 1)
      );
      --general-navbar-footer-background-opacity: 1;
      --general-navbar-footer-color: #424242;
      --general-panel-width: 280px;
      --general-big-panel-width: 560px;
      --general-content-container-width: 980px;
      --general-background-color: var(
        --token-colorBgBase,
        rgba(247, 246, 246, 1)
      );
      --general-sidebar-color: var(--token-colorBorder, #949494);
      --general-sidebar-background-color: var(
        --general-background-color,
        #ffffff
      );
      --general-sidebar-h3-color: #cccccc;
      --general-sidebar-h3-border-color: 1px solid #444444;
      --general-sidebar-topbar-background-color-3: #383e48;
      --general-sidebar-topbar-background-color-2: rgba(103, 172, 91, 1);
      --general-sidebar-topbar-background-color-4: var(--paper-grey-200);
      --general-sidebar-topbar-color-4: #222222;
      --general-sidebar-topbar-background-color: rgba(24, 24, 24, 1);
      --general-sidebar-topbar-color: #efefef;
      --general-sidebar-selected-color: var(--token-colorPrimary, #37b076);
      --general-sidebar-selected-background-color: transparent;
      --general-sidebar-selected-background-gradient-color: transparent;
      --general-sidebar-selected-border-left: 3px solid
        var(--general-sidebar-selected-color);
      --general-sidebar-footer-color: #777777;
      --general-sidebar-navbar-footer-color: #222222;
      --general-sidebar-item-even-background-color: transparent;
      --general-sidebar-item-odd-background-color: rgba(239, 240, 242, 0.95);
      --general-sidepanel-color: #dddddd;
      --general-sidepanel-background-color: var(
        --general-background-color,
        #ffffff
      ); /*rgba(244, 245, 247, 1); rgba(48, 48, 48, 1.0);*/
      --general-tabbar-background-color: var(
        --token-colorBgContainer,
        --general-background-color
      );
      --general-tabbar-tab-disabled-color: var(--general-sidebar-color);
      --general-tabbar-button-color: rgba(103, 172, 91, 1);
      --general-sub-tabbar-background-color: var(
        --token-colorBgContainer,
        #ffffff
      );
      --general-textfield-selected-color: var(--general-primary-color, #27824f);
      --general-textfield-idle-color: var(--general-primary-color, #27824f);
      --general-dropdown-color: var(--general-sidebar-color);
      --general-checkbox-color: var(
        --token-colorPrimary,
        --general-textfield-selected-color
      );
      --general-textarea-color: var(
        --token-colorPrimary,
        --general-textfield-selected-color
      );
      --general-textarea-idle-color: var(
        --token-colorPrimary,
        --general-textfield-selected-color
      );
      --general-select-color: var(
        --token-colorPrimary,
        --general-textfield-selected-color
      );
      --general-select-idle-color: var(
        --token-colorPrimary,
        --general-textfield-selected-color
      );
      --general-button-background-color: var(--token-colorPrimary, #27824f);
      --general-button-color: var(
        --token-colorText,
        --general-background-color,
        #ffffff
      );
      --general-button-disabled-background-color: var(--token-colorSuccess);
      --general-button-disabled-color: var(--general-background-color, #ffffff);
      --general-switch-off-color: var(--token-colorBorder, #aaa);
      --general-switch-on-color: var(--token-colorPrimary);
      --general-switch-on-background-color: var(--general-primaryBg, #e3e7d8);
      --general-slider-color: var(
        --token-colorPrimary,
        --general-textfield-selected-color
      );
      --general-dialog-background-color: var(
        --token-colorBgContainer,
        --general-background-color,
        #ffffff
      );
      --token-fontFamily:
        'Ubuntu', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji',
        'Segoe UI Symbol', AppleSDGothic, 'Apple SD Gothic Neo', NanumGothic,
        'NanumGothicOTF', 'Nanum Gothic', 'Malgun Gothic', sans-serif;
      --general-monospace-font-family:
        'Ubuntu Mono', Menlo, Courier, 'Courier New', RobotoMono, sans-serif;
      --general-progress-bar-bg: var(--token-colorBorderSecondary, #e8e8e8);
      --general-progress-bar-reserved: var(--token-blue-7);
      --general-progress-bar-using: var(--token-green-7);
      --lumo-font-family: var(--token-fontFamily);
      --general-warning-text: var(--paper-red-400);

      /**
      * NOTE: For rendering dark theme of vaadin components, we need to set "theme='dark'" attribute to the vaadin components.
      *       e.g) <vaadin-grid theme="dark"></vaadin-grid> 
      */
      [theme~='dark'] {
        --lumo-primary-color: var(--token-colorPrimary);
        --lumo-secondary-text-color: var(--token-colorTextSecondary);
        --lumo-tertiary-text-color: var(--token-colorTextTertiary);
        --lumo-base-color: var(--token-colorBgContainer);
        --lumo-header-text-color: var(--token-colorText);
        --lumo-body-text-color: var(--token-colorText);
        --lumo-contrast-10pct: var(--token-colorBorder);
        --lumo-contrast-20pct: var(--token-colorBorder, #ccc);
      }
    }

    /* Scrollbar stylings */
    /* Define both web components and react for supporting electron mode */
    /* Works on Firefox */
    * {
      scrollbar-width: 2px;
      scrollbar-color: var(--token-colorBorderSecondary, #464646)
        var(--token-colorBgElevated, transparent);
    }

    /* Works on Chrome, Edge, and Safari */
    *::-webkit-scrollbar {
      max-width: 2px;
      background-color: var(--token-colorBgElevated, transparent);
    }

    *::-webkit-scrollbar-track {
      background: var(--token-colorBgElevated, transparent);
    }

    *::-webkit-scrollbar-thumb {
      background-color: var(--token-colorBorderSecondary, #464646);
    }

    body {
      background-color: var(--general-background-color, #fafafa);
      font-family: var(--token-fontFamily);
      --lumo-font-family: var(--token-fontFamily);
      font-weight: 400;
      font-size: 14px;
      color: var(--token-colorText);
      margin: 0;
      overflow-x: hidden;
      word-break: keep-all;
    }

    [unresolved] {
      background-repeat: no-repeat;
      background-position: 50% 50vh;
      background-color: var(--general-background-color, #fafafa);
    }

    span {
      pointer-events: none;
    }

    span[slot='secondary'] {
      color: var(--token-colorTextDescription);
    }

    body,
    .fonts-loaded body {
      font-family:
        'Ubuntu',
        Roboto,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Helvetica,
        Arial,
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Sans KR',
        'Noto Sans',
        AppleSDGothic,
        NanumGothic,
        'NanumGothicOTF',
        'Nanum Gothic',
        'Malgun Gothic',
        sans-serif;
    }

    section {
      padding: 5px 0;
    }

    a,
    a:visited {
      text-decoration: none;
      cursor: pointer;
      color: var(--token-colorLink);
    }

    a:hover {
      color: var(--token-colorLinkHover, #3e872d);
    }

    a.export-csv {
      color: var(--token-colorText);
    }

    fieldset {
      padding: 0;
      border: 0;
    }

    footer {
      bottom: 0;
      text-align: center;
      color: #aaaaaa;
    }

    footer a {
      color: #cccccc !important;
    }

    #content {
      padding: 0;
      margin: 0 auto 5px auto;
    }

    .monospace {
      font-family: var(--general-monospace-font-family);
    }

    .clearfix:after {
      content: '.';
      visibility: hidden;
      display: block;
      height: 0;
      clear: both;
    }

    div.ui-draggable {
      width: 100%;
    }

    .lazyload {
      opacity: 0;
      transform: scale(0.8);
    }

    .lazyloaded {
      opacity: 1;
      transform: scale(1);
      transition: all 400ms;
    }

    .paper-header {
      height: 60px;
      font-size: 16px;
      line-height: 60px;
      padding: 0 10px;
      color: var(--token-colorText, white);
      transition: height 0.2s;
    }

    .paper-header a {
      color: var(--token-colorText, white);
    }

    .paper-header.tall {
      height: 120px;
    }

    .paper-header.medium-tall {
      height: 100px;
      line-height: 50px;
    }

    .cover {
      margin: 60px;
    }

    backend-ai-multi-select {
      /* override for mwc-list */
      --select-primary-theme: var(
        --token-colorPrimary,
        --general-sidebar-color
      );
      --select-secondary-theme: var(--general-checkbox-color);
      --select-color: var(--token-colorText);
      --select-background-color: var(
        --token-colorBgElevated,
        --general-background-color,
        #efefef
      );
      --select-background-border-radius: 5px;
      --select-box-shadow: var(
        --token-boxShadow,
        0 1px 3px -1px rgba(0, 0, 0, 60%),
        0 3px 12px -1px rgb(200, 200, 200, 80%)
      );
      --selected-item-disabled-text-color: var(--token-colorTextDisabled);

      /* override for selected-area */
      --select-title-font-size: 10px;
      --selected-area-border-radius: var(--token-borderRadius, 5px);
      --selected-area-border: none;
      --selected-area-padding: 5px;
      --selected-area-min-height: 24px;
      --selected-area-height: 100%;

      /* override for selected-item */
      --selected-item-font-family: var(--token-fontFamily);
      --selected-item-theme-color: #c8ced7;
      --selected-item-theme-font-color: #182739;
      --selected-item-unelevated-theme-color: #c8ced7;
      --selected-item-unelevated-theme-color: #c8ced7;
      --selected-item-outlined-theme-font-color: black;
      --selected-item-unelevated-theme-font-color: black;
      --selected-item-font-size: 14px;
      --selected-item-text-transform: none;
    }

    div.card {
      display: block;
      background: var(--general-background-color);
      box-sizing: border-box;
      padding: 0;
      border-radius: 2px;
    }

    #content > div.card {
      max-width: var(--general-content-container-width, 980px);
    }

    @media screen and (max-width: 399px) {
      div.card {
        margin-left: 0;
        margin-right: 0;
      }
    }

    @media screen and (max-width: 449px) {
      #content > div.card {
        width: 100%;
      }
    }

    @media screen and (min-width: 450px) {
      #content > div,
      #content > div.card {
        width: 100%;
        --card-elevation: 0;
        --card-padding: 0;
      }

      #content > div.card {
        margin: 0 !important;
      }
    }

    @media screen and (max-width: 899px) {
      .item div.layout {
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
      }
    }

    mwc-multi-select {
      --mdc-select-min-width: 100px; /* Fallback to apply width */
    }

    mwc-button.primary-action,
    mwc-button.primary-action[outlined],
    mwc-button.primary-action[raised],
    mwc-button.primary-action[unelevated] {
      border-radius: 5px;
      background-color: var(--token-colorPrimary);
      --mdc-theme-primary: var(
        --token-colorWhite,
        --general-button-color
      ); /* gradient-color doesn't work in mwc-button styling */
      --mdc-theme-on-primary: var(--token-colorWhite, --general-button-color);
    }

    mwc-button.primary-action[disabled] {
      border: 1px solid var(--token-colorBorder, #424242);
      border-radius: 5px;
      background-color: var(--token-colorBgContainerDisabled,);
      --mdc-theme-primary: var(
        --token-colorWhite,
        --general-button-color
      ); /* gradient-color doesn't work in mwc-button styling */
      --mdc-theme-on-primary: var(--token-colorWhite, --general-button-color);
    }

    mwc-button.operation {
      margin: 0px 5px;
    }

    mwc-icon {
      color: var(--token-colorText);
    }

    mwc-icon-button.pagination {
      --mdc-icon-button-size: 30px;
      --mdc-theme-text-disabled-on-light: var(
        --token-colorTextDisabled,
        --paper-grey-400
      );
      color: var(--token-colorText);
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
    }

    mwc-icon-button[disabled].pagination {
      background-color: var(
        --token-colorBgContainer,
        --var-color-bg-container-disabled,
        --paper-grey-100
      );
    }

    mwc-list-item,
    mwc-list mwc-list-item {
      font-size: var(--token-fontSize, 14px);
      font-family: var(--token-fontFamily);
      color: var(--token-colorText);
      background-color: var(--token-colorBgContainer);
      --mdc-typography-font-family: var(--token-fontFamily);
    }

    mwc-menu {
      --mdc-theme-surface: var(--token-colorBgContainer);
      --mdc-menu-item-height: auto;
    }

    mwc-switch {
      --mdc-switch-unselected-handle-color: var(--general-switch-off-color);
      --mdc-switch-unselected-track-color: var(
        --general-switch-on-background-color
      ) !important;
      --mdc-switch-unselected-hover-handle-color: var(
        --general-switch-off-color
      );
      --mdc-switch-unselected-hover-track-color: var(
        --general-switch-on-background-color
      );
      --mdc-switch-unselected-focus-handle-color: var(
        --general-switch-off-color
      );
      --mdc-switch-unselected-focus-track-color: var(
        --general-switch-on-background-color
      );
      --mdc-switch-unselected-pressed-handle-color: var(
        --general-switch-off-color
      );
      --mdc-switch-unselected-pressed-track-color: var(
        --general-switch-on-background-color
      );
      --mdc-switch-selected-handle-color: var(--general-switch-on-color);
      --mdc-switch-selected-track-color: var(
        --general-switch-on-background-color
      ) !important;
      --mdc-switch-selected-hover-handle-color: var(--general-switch-on-color);
      --mdc-switch-selected-hover-track-color: var(
        --general-switch-on-background-color
      );
      --mdc-switch-selected-hover-state-layer-color: var(
        --general-switch-on-color
      );
      --mdc-switch-selected-focus-handle-color: var(--general-switch-on-color);
      --mdc-switch-selected-focus-track-color: var(
        --general-switch-on-background-color
      );
      --mdc-switch-selected-focus-state-layer-color: var(
        --general-switch-on-color
      );
      --mdc-switch-selected-pressed-handle-color: var(
        --general-switch-on-color
      );
      --mdc-switch-selected-pressed-track-color: var(
        --general-switch-on-background-color
      );
      --mdc-switch-selected-pressed-state-layer-color: var(
        --general-switch-on-color
      );
    }

    mwc-switch[disabled] {
      --mdc-switch-disabled-selected-handle-color: var(
        --general-switch-on-color
      );
      --mdc-switch-disabled-selected-track-color: var(
        --general-switch-on-color
      ) !important;
      --mdc-switch-disabled-unselected-track-color: var(--token-colorText);
    }

    mwc-checkbox,
    mwc-check-list-item {
      --mdc-theme-secondary: var(--token-colorPrimary);
      --mdc-checkbox-unchecked-color: var(--token-colorBorder);
    }

    mwc-slider {
      --mdc-theme-on-surface: var(--token-colorTextDisabled);
    }

    div.card p {
      padding: 10px;
    }

    div.card > .entry > p {
      padding: 5px;
    }

    div.card .commands {
      margin: 0;
      border-top: 1px solid var(--token-colorBorder, #dddddd);
      text-align: left;
    }

    div.card.item div.items {
      padding-bottom: 10px;
    }

    div.card .commands.float {
      border-top: none;
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .panels div.card,
    .panels div {
      width: var(--general-panel-width);
    }

    .wide-panels {
      margin: 0 0 10px 0;
    }

    .wide-panels div.card {
      width: 100%;
      margin: 0 0 16px 0;
    }

    .line {
      margin-bottom: 10px;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -ms-flex-direction: row;
      -webkit-flex-direction: row;
      flex-direction: row;
    }

    .line span {
      margin-left: 24px;
    }

    .line {
      display: inline-block;
      width: auto;
      height: 1px;
      border: 0;
      border-top: 1px solid var(--token-colorBorder, #ccc);
      margin: 20px;
      padding: 0;
    }

    .resource-line {
      border-bottom: 1px solid var(--token-colorBorder, #ccc);
      height: 1px;
      width: 60%;
      margin-left: 80px;
      margin-bottom: 10px;
    }

    div.card > h3 {
      font-size: 20px;
      font-weight: 400;
      padding: 10px 20px;
      margin: 0;
      display: block;
      border-bottom: 1px solid var(--token-colorBorder, #dddddd);
    }

    div.card > h3 > .date {
      font-size: 12px;
      text-align: right;
      color: #888888;
      margin-left: 20px;
    }

    div.card > h3.blue,
    div.card > h4.blue {
      border-left: 3px solid var(--paper-light-blue-400);
    }

    div.card > h3.red,
    div.card > h4.red {
      border-left: 3px solid var(--paper-red-400);
    }

    div.card > h3.green,
    div.card > h4.green {
      border-left: 3px solid var(--paper-green-400);
    }

    div.card > h3.orange,
    div.card > h4.orange {
      border-left: 3px solid var(--paper-orange-400);
    }

    div.card > h3.cyan,
    div.card > h4.cyan {
      border-left: 3px solid var(--paper-cyan-400);
    }

    div.card > h3.lime,
    div.card > h4.lime {
      border-left: 3px solid var(--paper-lime-400);
    }

    div.card > h3.pink,
    div.card > h4.pink {
      border-left: 3px solid var(--paper-pink-400);
    }

    div.card > h4 {
      font-size: 14px;
      padding: 5px 15px 5px 20px;
      margin: 0 0 10px 0;
      display: block;
      border-bottom: 1px solid var(--token-colorBorder, #dddddd);
      -ms-flex-pack: justify;
      -webkit-justify-content: space-between;
      justify-content: space-between;
    }

    div.card .flex {
      display: flex;
    }

    div.card.entries > div {
      margin: 20px;
    }

    mwc-button,
    mwc-button[unelevated],
    mwc-button[raised] {
      background-image: none;
      --mdc-theme-primary: var(
        --token-colorPrimary,
        --general-button-background-color
      );
      --mdc-theme-on-primary: var(--token-colorWhite, --general-button-color);
      --mdc-typography-font-family: var(--token-fontFamily);
    }

    mwc-icon-button[disabled] {
      --mdc-theme-text-disabled-on-light: var(--token-colorTextDisabled);
    }

    mwc-button[disabled] {
      --mdc-button-disabled-ink-color: var(--token-colorTextDisabled);
    }

    mwc-textfield {
      --mdc-theme-primary: var(
        --token-colorPrimary,
        --general-textfield-selected-color
      );
      --mdc-text-field-hover-line-color: var(--token-colorPrimary, transparent);
      --mdc-text-field-idle-line-color: var(
        --token-colorPrimary,
        --general-textfield-idle-color
      );
      --mdc-text-field-fill-color: var(--token-colorBgContainer, transparent);
      --mdc-typography-font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-size: var(--token-fontSize, 14px);
      --mdc-typography-subtitle1-font-color: var(--token-colorText, black);
      --mdc-typography-subtitle1-font-weight: 400;
      --mdc-typography-subtitle1-line-height: 16px;
      --mdc-text-field-label-ink-color: var(--token-colorText);
      --mdc-text-field-ink-color: var(--token-colorText);
      --mdc-text-field-disabled-fill-color: var(--token-colorBgContainer);
      --mdc-text-field-disabled-ink-color: var(--token-colorTextDisabled);
      --mdc-text-field-disabled-line-color: var(--token-colorTextDisabled);
      --mdc-text-field-outlined-disabled-border-color: var(
        --token-colorTextDisabled
      );
      --mdc-text-field-disabled-fill-color: var(
        --token-colorBgContainerDisabled
      );
    }

    mwc-textarea {
      --mdc-text-field-fill-color: var(--token-colorBgContainer, transparent);
      --mdc-theme-primary: var(--token-colorPrimary, --general-textarea-color);
      --mdc-text-area-outlined-idle-border-color: var(
        --token-colorPrimary,
        --general-textarea-idle-color
      );
      font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-size: var(--token-fontSize, 14px);
      --mdc-typography-subtitle1-font-color: var(--token-colorText);
      --mdc-typography-subtitle1-font-weight: 400;
      --mdc-typography-subtitle1-line-height: 16px;
      --mdc-text-field-label-ink-color: var(--token-colorText);
      --mdc-text-field-ink-color: var(--token-colorText);
      --mdc-text-area-outlined-disabled-border-color: var(
        --token-colorTextDisabled
      );
    }

    mwc-formfield {
      --mdc-theme-text-primary-on-background: var(--token-colorText);
    }

    mwc-select {
      font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-size: var(--token-fontSize, 14px);
      --mdc-typography-subtitle1-font-color: var(--token-colorText, black);
      --mdc-typography-subtitle1-font-weight: 400;
      --mdc-typography-subtitle1-line-height: 16px;
      --mdc-theme-primary: var(--token-colorPrimary, --general-select-color);
      --mdc-select-idle-line-color: var(
        --token-colorPrimary,
        --general-select-idle-color
      );
      --mdc-select-hover-line-color: var(
        --token-colorPrimary,
        --general-select-color
      );
      --mdc-select-outlined-border-color: var(
        --token-colorPrimary,
        --general-select-color
      );
      --mdc-select-outlined-idle-border-color: var(
        --token-colorBorder,
        --general-select-idle-color
      );
      --mdc-select-outlined-hover-border-color: var(
        --token-colorPrimary,
        --general-select-color
      );
      --mdc-select-outlined-disabled-border-color: var(
        --token-colorTextDisabled,
        rgba(255, 255, 255, 0.87)
      );
      --mdc-select-fill-color: var(--token-colorBgContainer, transparent);
      --mdc-select-disabled-fill-color: var(
        --token-colorBgContainer,
        transparent
      );
      --mdc-select-ink-color: var(--token-colorText, black);
      --mdc-select-label-ink-color: var(--token-colorText, black);
      --mdc-select-focused-label-color: var(
        --token-colorPrimary,
        rgba(24, 24, 24, 1)
      );
      --mdc-select-disabled-ink-color: var(--token-colorTextDisabled, #747474);
      --mdc-select-dropdown-icon-color: var(--token-colorTextDisabled, #747474);
      --mdc-select-focused-dropdown-icon-color: var(
        --token-colorTextDisabled,
        rgba(255, 255, 255, 0.42)
      );
      --mdc-theme-surface: var(--token-colorBgContainer, #f1f1f1);
      --mdc-select-disabled-dropdown-icon-color: var(--token-colorTextDisabled);
    }

    mwc-radio {
      --mdc-theme-secondary: var(--token-colorPrimary);
      --mdc-radio-unchecked-color: var(--token-colorBorder);
    }

    h3.tab {
      background-color: var(--general-tabbar-background-color);
      border-radius: 5px 5px 0px 0px;
      margin: 0px auto;
    }

    mwc-tab,
    mwc-tab-bar {
      background-color: var(--general-tabbar-background-color);
      --mdc-theme-primary: var(--general-sidebar-selected-color);
      --mdc-text-transform: none;
      --mdc-tab-color-default: var(
        --token-colorTextSecondary,
        --general-tabbar-background-color
      );
      --mdc-tab-text-label-color-default: var(--token-colorText);
      font-family: var(--token-fontFamily);
    }

    .bg-blue {
      background-color: var(--paper-light-blue-400);
      --mdc-theme-primary: var(--paper-light-blue-400);
    }

    .bg-red {
      background-color: var(--paper-red-400);
      --mdc-theme-primary: var(--paper-red-400);
    }

    .bg-yellow {
      background-color: var(--paper-yellow-400);
      --mdc-theme-primary: var(--paper-yellow-400);
    }

    .bg-orange {
      background-color: var(--paper-amber-400);
      --mdc-theme-primary: var(--paper-amber-400);
    }

    .bg-green {
      background-color: var(--paper-green-400);
      --mdc-theme-primary: var(--paper-green-400);
    }

    .bg-cyan {
      background-color: var(--paper-cyan-400);
      --mdc-theme-primary: var(--paper-cyan-400);
    }

    .bg-lime {
      background-color: var(--paper-lime-400);
      --mdc-theme-primary: var(--paper-lime-400);
    }

    .bg-pink {
      background-color: var(--paper-pink-a200);
      --mdc-theme-primary: var(--paper-pink-a200);
    }

    .bg-purple {
      background-color: var(--paper-purple-400);
      --mdc-theme-primary: var(--paper-purple-400);
    }

    .white {
      color: #ffffff !important;
    }

    .black {
      color: #222222 !important;
    }

    .fg.black {
      color: #222222;
    }

    .fg.grey {
      color: var(--paper-grey-600) !important;
      --mdc-theme-primary: var(--paper-grey-600) !important;
    }

    .fg.blue {
      color: var(--paper-light-blue-400) !important;
      --mdc-theme-primary: var(--paper-light-blue-400) !important;
    }

    .fg.red {
      color: var(--paper-red-400) !important;
      --mdc-theme-primary: var(--paper-red-400) !important;
    }

    .fg.yellow {
      color: var(--paper-yellow-400) !important;
      --mdc-theme-primary: var(--paper-yellow-400) !important;
    }

    .fg.orange {
      color: var(--paper-amber-400) !important;
      --mdc-theme-primary: var(--paper-amber-400) !important;
    }

    .fg.green {
      color: var(--paper-green-400) !important;
      --mdc-theme-primary: var(--paper-green-400) !important;
    }

    .fg.teal {
      color: var(--paper-teal-400) !important;
      --mdc-theme-primary: var(--paper-teal-400) !important;
    }

    .fg.cyan {
      color: var(--paper-cyan-400) !important;
      --mdc-theme-primary: var(--paper-cyan-400) !important;
    }

    .fg.lime {
      color: var(--paper-lime-400) !important;
      --mdc-theme-primary: var(--paper-lime-400) !important;
    }

    .fg.pink {
      color: var(--paper-pink-a200) !important;
      --mdc-theme-primary: var(--paper-pink-a200) !important;
    }

    .fg.purple {
      color: var(--paper-purple-400) !important;
      --mdc-theme-primary: var(--paper-purple-400) !important;
    }

    /* Layout */
    .flex-1-container {
      -ms-flex: 1 1 0.000000001px;
      -webkit-flex: 1;
      flex: 1;
      -webkit-flex-basis: 0.000000001px;
      flex-basis: 0.000000001px;
    }

    .centered {
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .distancing {
      margin: 15px;
    }

    div.card > h4 {
      font-weight: 200;
    }

    /* Loading spinner */
    #lablup-loading-spinner {
      position: fixed;
      width: 30px;
      height: 30px;
      bottom: 6px;
      left: 6px;
      z-index: 1000;
    }

    /* Tab on head */
    div.card h3.tab {
      padding-top: 0;
      padding-bottom: 0;
      padding-left: 0;
    }

    /* Button */
    mwc-button {
      --mdc-typography-button-font-size: var(--token-fontSize, 14px);
    }

    mwc-button[outlined] {
      --mdc-button-outline-color: var(--token-colorBorder);
    }

    mwc-button.full-size,
    mwc-button.full {
      width: 100%;
    }

    lablup-progress-bar {
      --progress-bar-width: 186px;
      --progress-bar-height: 17px;
      --progress-bar-font-family: var(--token-fontFamily);
      --progress-bar-border-radius: 3px;
      --progress-bar-font-color-inverse: var(--token-colorBgBase, white);
      --progress-bar-font-color: var(--token-colorText, black);
      margin-bottom: 5px;
    }

    lablup-progress-bar.start {
      --progress-bar-background: var(--general-progress-bar-reserved);
    }

    lablup-progress-bar.end {
      --progress-bar-background: var(--general-progress-bar-using);
    }

    div.progress-bar {
      position: relative;
    }

    div.progress-bar > span.gauge-label {
      position: absolute;
      left: 0.5em;
      top: 25%;
      z-index: 1;
      color: var(--token-colorTextSecondary, #2f2f2f);
    }

    .gauge-label {
      width: inherit;
      font-weight: bold;
      font-size: 10px;
      color: var(--token-colorTextSecondary, #2f2f2f);
    }

    .gauge-name {
      float: right;
      font-size: 14px;
      font-weight: bold;
      color: var(--token-colorTextSecondary, #2f2f2f);
    }

    span.percentage {
      font-size: 10px;
      color: var(--token-colorTextSecondary, #2f2f2f);
    }

    span.start-bar {
      padding-bottom: 5px;
      width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    span.end-bar {
      margin-top: 5px;
      padding-bottom: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
    }

    span.helper-text {
      font-size: 0.75rem;
      font-weight: bold;
      color: var(--general-textfield-selected-color);
    }

    .resource-name {
      width: 60px;
      text-align: right;
      display: inline-block !important;
      margin: auto 20px auto 0px;
    }

    .resource-legend-stack {
      margin-bottom: 5px;
    }

    span.resource-legend {
      color: var(--token-colorTextSecondary, --general-sidebar-color);
      margin-right: 5px;
    }

    .resource-legend-icon {
      min-width: 10px;
      height: 10px;
      margin-top: 2px;
      margin-left: 10px;
      margin-right: 3px;
      border-radius: 4px;
    }

    .resource-legend-icon.start {
      background-color: var(--token-blue-7);
    }

    .resource-legend-icon.end {
      background-color: var(--token-green-7);
    }

    .resource-legend-icon.total {
      background-color: #e0e0e0;
    }

    .vertical-card {
      margin: 20px;
    }

    vaadin-grid {
      --lumo-font-family: var(--token-fontFamily);
      font-family: var(--token-fontFamily);
    }

    .temporarily-hide {
      display: none !important;
    }

    div.list-wrapper {
      height: auto;
    }

    div.blank-box {
      padding: 3rem 0;
    }

    div.blank-box-medium {
      padding: 8.8rem 0;
    }

    div.blank-box-large {
      padding: 11.3rem 0;
    }

    div.list-wrapper {
      position: relative;
    }

    span.list-message {
      font-size: 20px;
      font-weight: 200;
      display: block;
      color: #999999;
    }

    backend-ai-dialog {
      mwc-list-item,
      mwc-icon,
      mwc-icon-button,
      div.card {
        background-color: var(--token-colorBgElevated);
      }

      mwc-icon,
      mwc-icon-button {
        color: var(--token-colorTextSecondary);
      }

      mwc-select {
        --mdc-select-fill-color: var(--token-colorBgElevated, transparent);
        --mdc-select-disabled-fill-color: var(
          --token-colorTextDisabled,
          transparent
        );
        --mdc-theme-surface: var(--token-colorBgElevated, #f1f1f1);
      }

      mwc-textfield,
      mwc-textarea {
        --mdc-text-field-fill-color: var(--token-colorBgElevated);
        --mdc-typography-font-family: var(--token-fontFamily);
        --mdc-theme-primary: var(--token-colorPrimary);
        --mdc-text-field-label-ink-color: var(--token-colorTextSecondary);
      }

      vaadin-grid[theme~='dark'] {
        --lumo-base-color: var(--token-colorBgElevated) !important;
      }

      div[slot='footer'] {
        mwc-button[unelevated],
        mwc-button[raised] {
          --mdc-theme-on-primary: var(
            --token-colorWhite,
            --general-button-color
          );
        }
      }
    }

    div.note-container {
      background-color: var(--paper-green-100);
    }

    div.note-title {
      background-color: var(--paper-green-400);
      padding: 5px 10px;
      color: #ffffff;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -ms-flex-align: center;
      -webkit-align-items: center;
      align-items: center;
    }

    div.note-title mwc-icon {
      margin-right: 6px;
      background-color: var(--paper-green-400);
    }

    div.note-contents {
      padding: 20px;
      /* Fix the color for readability */
      color: #222222;
    }
  `,
];

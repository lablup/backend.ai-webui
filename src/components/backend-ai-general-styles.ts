import {css} from 'lit-element';
import {PaperColor} from "./paper-color";

export const BackendAiStyles = [
  PaperColor,
  // language=CSS
  css`
    :host > *, html {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      --general-menu-background-color: transparent;
      --general-menu-background-color-less: rgba(255, 255, 255, 0.6);
      --general-menu-background-border: rgba(23, 23, 23, 1);
      --general-menu-background-opacity: 1;
      --general-menu-color-2: #242424;
      --general-menu-color: #efefef;
      --general-navbar-footer-background-color-r: 255;
      --general-navbar-footer-background-color-g: 255;
      --general-navbar-footer-background-color-b: 255;
      --general-navbar-footer-background-color: rgba(255, 255, 255, 0.95);
      --general-navbar-footer-background-color-less: rgba(255, 255, 255, 0.6);
      --general-navbar-footer-background-border: rgba(23, 23, 23, 1);
      --general-navbar-footer-background-opacity: 1;
      --general-navbar-footer-color: #424242;
      --general-panel-width: 280px;
      --general-big-panel-width: 560px;
      --general-content-container-width: 980px;
      --general-background-color: rgba(247, 246, 246, 1);
      --general-sidebar-color: #949494;
      --general-sidebar-background-color: #2a2c30;
      --general-sidebar-h3-color: #cccccc;
      --general-sidebar-h3-border-color: 1px solid #444444;
      --general-sidebar-topbar-background-color-3: #383e48;
      --general-sidebar-topbar-background-color-2: rgba(103, 172, 91, 1.00);
      --general-sidebar-topbar-background-color-4: var(--paper-grey-200);
      --general-sidebar-topbar-color-4: #222222;
      --general-sidebar-topbar-background-color: rgba(24, 24, 24, 1);
      --general-sidebar-topbar-color: #efefef;
      --general-sidebar-selected-color: #72EB51; /*var(--paper-green-400);*/
      --general-sidebar-selected-background-color: transparent;
      --general-sidebar-selected-background-gradient-color: transparent;
      --general-sidebar-selected-border-left: 3px solid var(--general-sidebar-selected-color);
      --general-sidebar-footer-color: #777777;
      --general-sidebar-navbar-footer-color: #222222;
      --general-sidebar-item-even-background-color: transparent;
      --general-sidebar-item-odd-background-color: rgba(239, 240, 242, 0.95);
      --general-sidepanel-color: #dddddd;
      --general-sidepanel-background-color: #ffffff; /*rgba(244, 245, 247, 1); rgba(48, 48, 48, 1.0);*/
      --general-tabbar-background-color: var(--general-sidebar-background-color);
      --general-tabbar-tab-disabled-color: var(--general-sidebar-color);
      --general-tabbar-button-color: var(--general-sidebar-selected-color);
      --general-textfield-selected-color: #27824F;
      --general-dropdown-color: var(--general-sidebar-color);
      --general-checkbox-color: var(--general-textfield-selected-color);
      --general-button-background-color: #27824F;
      --general-button-color: #ffffff;
      --general-switch-off-color: #AAA;
      --general-switch-on-color: #27824F;
      --general-slider-color: var(--general-textfield-selected-color);
      --general-dialog-background-color: #ffffff;
      --general-font-family: 'Ubuntu', 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
      --general-monospace-font-family: Menlo, Courier, "Courier New", RobotoMono, sans-serif;
    }

    body {
      background-color: var(--general-background-color, #fafafa);
      font-family: var(--general-font-family);
      font-weight: 400;
      font-size: 14px;
      color: #222222;
      margin: 0;
      overflow-x: hidden;
      word-break: keep-all;
    }

    [unresolved] {
      background-repeat: no-repeat;
      background-position: 50% 50vh;
      background-color: var(--general-background-color, #fafafa);
    }

    span,
    wl-icon {
      pointer-events: none;
    }

    body,
    .fonts-loaded body {
      font-family: 'Ubuntu', 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans KR", "Noto Sans", AppleSDGothic, NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
    }

    section {
      padding: 5px 0;
    }

    a {
      text-decoration: none;
      cursor: pointer;
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
      padding: 0 auto;
      margin: 0 auto 5px auto;
    }

    .monospace {
      font-family: var(--general-monospace-font-family);
    }

    .clearfix:after {
      content: ".";
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

    .wl-card-title {
      font-weight: 200;
    }

    wl-select {
      --input-font-family: var(--general-font-family);
    }

    ::-webkit-scrollbar {
      max-width: 2px;
      background-color: transparent;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background-color: #464646;
    }

    .paper-header {
      height: 60px;
      font-size: 16px;
      line-height: 60px;
      padding: 0 10px;
      color: white;
      transition: height 0.2s;
    }

    .paper-header a {
      color: white;
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

    wl-icon.tiny {
      --icon-size: 12px;
    }

    wl-card {
      display: block;
      background: white;
      box-sizing: border-box;
      padding: 0;
      border-radius: 2px;
    }

    div.item {
      color: #000000;
    }

    #content > wl-card {
      max-width: var(--general-content-container-width, 980px);
    }

    @media screen and (max-width: 399px) {
      wl-card {
        margin-left: 0;
        margin-right: 0;
      }
    }

    @media screen and (max-width: 449px) {
      #content > wl-card {
        width: 100%;
      }
    }

    @media screen and (min-width: 450px) {
      #content > wl-card,
      #content > div {
        width: 100%;
        --card-elevation: 0;
        --card-padding: 0;
      }

      #content > wl-card {
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

    mwc-button,
    mwc-button[outlined],
    mwc-button[raised],
    mwc-button[unelevated] {
      border-radius: 5px;
      background-image: linear-gradient(to bottom, #69cee0 0%, #38bd73 100%);
      --mdc-theme-primary: transparent; /* gradient-color doesn't work in mwc-button styling */
      --mdc-theme-on-primary: var(--general-button-color);
    }


    mwc-button.operation {
      margin: 0px 5px;
    }

    mwc-icon-button.pagination {
      --mdc-icon-button-size: 30px;
      --mdc-theme-text-disabled-on-light: var(--paper-grey-400);
      color: var(--general-button-background-color);
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
    }

    mwc-icon-button[disabled].pagination {
      background-color: var(--paper-grey-100);
    }

    mwc-switch {
      --mdc-theme-surface: var(--general-switch-off-color);
      --mdc-theme-on-surface: var(--general-switch-off-color);
      --mdc-theme-secondary: var(--general-switch-on-color);
    }

    wl-card p {
      padding: 10px;
    }

    wl-card > .entry > p {
      padding: 5px;
    }

    wl-card .commands {
      margin: 0;
      border-top: 1px solid #dddddd;
      text-align: left;
    }

    wl-card.item div.items {
      padding-bottom: 10px;
    }

    wl-card .commands.float {
      border-top: none;
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .panels wl-card,
    .panels div {
      width: var(--general-panel-width);
    }

    .wide-panels {
      margin: 0 0 10px 0;
    }

    .wide-panels wl-card {
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
      border-top: 1px solid #ccc;
      margin: 20px;
      padding: 0;
    }

    .resource-line {
      border-bottom: 1px solid #ccc;
      height: 1px;
      width: 60%;
      margin-left: 80px;
      margin-bottom: 10px;
    }

    wl-card > h3 {
      font-size: 20px;
      font-weight: 400;
      padding: 10px 20px;
      margin: 0;
      display: block;
      border-bottom: 1px solid #dddddd;
    }

    wl-card > h3 > .date {
      font-size: 12px;
      text-align: right;
      color: #888888;
      margin-left: 20px;
    }

    wl-card > h3.blue,
    wl-card > h4.blue {
      border-left: 3px solid var(--paper-light-blue-400);
    }

    wl-card > h3.red,
    wl-card > h4.red {
      border-left: 3px solid var(--paper-red-400);
    }

    wl-card > h3.green,
    wl-card > h4.green {
      border-left: 3px solid var(--paper-green-400);
    }

    wl-card > h3.orange,
    wl-card > h4.orange {

      border-left: 3px solid var(--paper-orange-400);
    }

    wl-card > h3.cyan,
    wl-card > h4.cyan {

      border-left: 3px solid var(--paper-cyan-400);
    }

    wl-card > h3.lime,
    wl-card > h4.lime {
      border-left: 3px solid var(--paper-lime-400);
    }

    wl-card > h3.pink,
    wl-card > h4.pink {
      border-left: 3px solid var(--paper-pink-400);
    }

    wl-card > h4 {
      font-size: 14px;
      padding: 5px 15px 5px 20px;
      margin: 0 0 10px 0;
      display: block;
      border-bottom: 1px solid #dddddd;
      -ms-flex-pack: justify;
      -webkit-justify-content: space-between;
      justify-content: space-between;
    }

    wl-card .flex {
      display: flex;
    }

    wl-card.entries > div {
      margin: 20px;
    }

    wl-backdrop {
      --backdrop-bg: rgba(255, 0, 0, 0.3);
      background: rgba(255, 0, 0, 0.3) !important;
    }

    paper-toolbar {
      --paper-toolbar-sm-height: 45px;
    }

    .bg-blue {
      background-color: var(--paper-light-blue-400);
    }

    .bg-red {
      background-color: var(--paper-red-400);
    }

    .bg-yellow {
      background-color: var(--paper-yellow-400);
    }

    .bg-orange {
      background-color: var(--paper-amber-400);
    }

    .bg-green {
      background-color: var(--paper-green-400);
    }

    .bg-cyan {
      background-color: var(--paper-cyan-400);
    }

    .bg-lime {
      background-color: var(--paper-lime-400);
    }

    .bg-pink {
      background-color: var(--paper-pink-a200);
    }

    .bg-purple {
      background-color: var(--paper-purple-400);
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

    .fg.blue {
      color: var(--paper-light-blue-400) !important;
    }

    .fg.red {
      color: var(--paper-red-400) !important;
    }

    .fg.yellow {
      color: var(--paper-yellow-400) !important;
    }

    .fg.orange {
      color: var(--paper-amber-400) !important;
    }

    .fg.green {
      color: var(--paper-green-400) !important;
    }

    .fg.teal {
      color: var(--paper-teal-400) !important;
    }

    .fg.cyan {
      color: var(--paper-cyan-400) !important;
    }

    .fg.lime {
      color: var(--paper-lime-400) !important;
    }

    .fg.pink {
      color: var(--paper-pink-a200) !important;
    }

    .fg.purple {
      color: var(--paper-purple-400) !important;
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
      margin:15px;
    }

    wl-card > h4 {
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
    wl-card h3.tab {
      padding-top: 0;
      padding-bottom: 0;
      padding-left: 0;
    }

    /* Button */
    wl-button {
      --button-padding: 8px;
      --button-font-size: 14px;
    }

    wl-button.full-size,
    wl-button.full {
      width: 100%;
    }

    wl-button,
    wl-expansion,
    wl-textfield {
      --font-family-serif: var(--general-font-family);
      --font-family-sans-serif: var(--general-font-family);
    }

    wl-progress-bar {
      --progress-bar-height: 17px;
      --progress-bar-bg: #e8e8e8;
      border-radius: 3px;
      margin: 3px auto;
      width: 186px;
    }


    wl-progress-bar.start-bar,
    .full-bar {
      --progress-bar-color: linear-gradient(to left, #722cd7, #5c7cfa);
    }

    wl-progress-bar.end-bar {
      --progress-bar-color: linear-gradient(to left, #18aa7c, #60bb43),
                         linear-gradient(to left, #722cd7, #5c7cfa);
    }

    div.progress-bar {
      position: relative;
    }

    div.progress-bar > span.gauge-label {
      position: absolute;
      left: 0.5em;
      top: 25%;
      z-index: 1;
      color: #2f2f2f;
    }

    .gauge-label {
      width: inherit;
      font-weight: bold;
      font-size: 10px;
      color: #2f2f2f;
    }

    .gauge-name {
      float: right;
      font-size: 14px;
      font-weight: bold;
      color: #2f2f2f;
    }

    span.percentage {
      font-size: 10px;
      color: #2f2f2f;
    }

    span.start-bar {
      margin: auto auto 5px 5px;
    }

    span.end-bar {
      margin: 5px auto auto 5px;
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
      color: var(--general-sidebar-color);
      margin-right: 5px;
    }

    div.resource-legend-icon {
      width:10px;
      height: 10px;
      margin-left: 10px;
      margin-right: 3px;
      border-radius: 4px;
    }

    .vertical-card {
      margin: 20px;
    }

    vaadin-grid {
      font-family: var(--general-font-family);
    }

    backend-ai-session-launcher#session-launcher {
      --component-color: #ffffff;
      --component-bg: rgb(104, 185, 155);
      --component-bg: linear-gradient(rgba(56,189,115, 0.5), rgba(56,189,115, 0.5)), linear-gradient(to bottom, #69cee0 0%, #38bd73 100%);
      --component-bg-hover: linear-gradient(180deg, rgba(98, 180, 131, 1) 0%, rgba(104, 185, 155, 1) 50%, rgba(93, 178, 113, 1) 100%);
      --component-bg-active: rgb(104, 185, 155);
      --component-shadow-color: #37c995;
    }

  `];

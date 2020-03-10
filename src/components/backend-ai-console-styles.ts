import {css} from 'lit-element';

export const BackendAiStyles =
  // language=CSS
  css`
    :host > *, html {
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      --general-menu-background-color-r: 255;
      --general-menu-background-color-g: 255;
      --general-menu-background-color-b: 255;
      --general-menu-background-color-3: rgba(var(--general-menu-background-color-r),
      var(--general-menu-background-color-g),
      var(--general-menu-background-color-b),
      1.0);
      --general-menu-background-color-2: var(--paper-grey-200);
      --general-menu-background-color: var(--paper-green-600);
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
      --general-background-color: rgba(244, 245, 247, 1);
      --general-sidebar-color: #dddddd;
      --general-sidebar-background-color: rgba(24, 24, 24, 1.0);
      --general-sidebar-h3-color: #424242;
      --general-sidebar-h3-border-color: 1px solid #dddddd;
      --general-sidebar-topbar-background-color-3: #383e48;
      --general-sidebar-topbar-background-color-2: rgba(103, 172, 91, 1.00);
      --general-sidebar-topbar-background-color-4: var(--paper-grey-200);
      --general-sidebar-topbar-color-4: #222222;
      --general-sidebar-topbar-background-color: rgba(24, 24, 24, 1);
      --general-sidebar-topbar-color: #efefef;
      --general-sidebar-topbar-shadow: {
      };
      --general-sidebar-selected-color: var(--paper-green-400);
      --general-sidebar-selected-background-color: rgba(244, 245, 247, 1); /* removed transparent */
      --general-sidebar-selected-background-gradient-color: transparent;
      --general-sidebar-selected-border-left: 5px solid #2ab6f6;
      --general-sidebar-footer-color: #777777;
      --general-sidebar-navbar-footer-color: #222222;
      --general-sidebar-item-even-background-color: transparent;
      --general-sidebar-item-odd-background-color: rgba(239, 240, 242, 0.95);
      --general-dialog-background-color: #ffffff;
      --app-drawer-width: 190px;
      --general-font-family: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
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
    iron-icon {
      pointer-events: none;
    }

    body,
    .fonts-loaded body {
      font-family: 'Quicksand', Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans KR", "Noto Sans", AppleSDGothic, NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
    }

    section {
      padding: 5px 0;
    }

    a {
      text-decoration: none;
      cursor: pointer;
    }

    fieldset {
      padding: 20px;
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

    .site-name {
      text-align: center;
      margin-left: 0;
      margin-right: auto;
      line-height: 16px;
      font-size: 16px;
      font-weight: 100;
      color: var(--general-sidebar-topbar-color, #efefef);
      font-family: var(--general-font-family);
    }

    .site-name > .bold {
      font-weight: 400;
    }

    .sidebar-footer {
      text-align: center;
      margin-left: auto;
      margin-right: auto;
      line-height: 16px;
      font-size: 12px;
      font-weight: 100;
      font-family: var(--general-font-family);
    }

    .monospace {
      font-family: var(--general-monospace-font-family);
    }

    .portrait-canvas {
      margin-left: 16px;
      padding-right: 5px;
    }

    .mini-ui .portrait-canvas {
      margin-left: 12px;
      padding-right: 0;
    }

    #main-panel-toolbar-buttons paper-icon-button {
      min-width: 40px;
    }

    #main-panel-toolbar-title {
      padding-top: 4px;
      line-height: 22px;
      height: 30px;
      overflow: hidden;
    }

    #main-panel-toolbar-title-condensed {
      font-size: 12px;
      padding-top: 3px;
      overflow: hidden;
    }

    .clearfix:after {
      content: ".";
      visibility: hidden;
      display: block;
      height: 0;
      clear: both;
    }

    ul.errorlist {
      margin: 0;
      padding: 0;
    }

    .errorlist li {
      background-color: #ff7701;
      color: white;
      display: block;
      margin: 0 0 3px;
      padding: 4px 5px;
    }

    @media screen and (max-width: 699px) {
      #toolbar-username, #toolbar-back-button {
        display: none;
      }
    }

    .copy-link-input {
      font-size: inherit;
      border: 0;
      border-bottom: 1px solid #eeeeee;
      width: 100%;
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

    .drawer-menu {
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overflow: -moz-scrollbars-none;
      -ms-overflow-style: none;
      /* pointer-events: none; */
      will-change: transform;
      /*@apply --shadow-elevation-4dp;*/
      /*border-bottom-right-radius: 20px;*/
      background-color: var(--general-sidebar-background-color, #fafafa);
    }

    app-drawer-layout:not([narrow]) [drawer-toggle] {
      display: none;
    }

    ::-webkit-scrollbar {
      max-width: 2px;
      background-color: transparent;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background-color: #464646;
    }

    .drawer-menu::-webkit-scrollbar {
      display: none !important;
    }

    #portrait-bar {
      height: 48px;
    }

    #main-toolbar {
      background-color: var(--general-menu-background-color);
      color: var(--general-menu-color);
      z-index: 1;
      overflow: visible;
    }

    #main-toolbar h2 {
      margin: 0 0 0 15px;
      font-weight: 300;
    }

    .drawer-menu footer {
      bottom: 0;
      color: var(--general-sidebar-footer-color, #aaaaaa);
      background-color: var(--general-sidebar-background-color);
      margin: 0;
      padding-bottom: 5px;
      font-size: 10px;
    }

    .drawer-menu footer a {
      color: var(--general-sidebar-footer-color, #aaaaaa) !important;
    }

    #sidebar-navbar-footer {
      position: absolute;
      right: 0;
      left: 0;
      bottom: 0 !important; /* Workaround to prevent miscalculated height */
      text-align: center;
      height: 45px;
      border-top: 1px solid #eeeeee;
      background-color: var(--general-navbar-footer-background-color);
      color: var(--general-sidebar-navbar-footer-color);
    }

    #app-navbar-footer {
      position: fixed;
      display: none;
      right: 0;
      bottom: 0;
      left: 0;
      text-align: left;
      height: 245px;
      width: 100%;
      border-top: 1px solid #eeeeee;
      background-color: var(--general-navbar-footer-background-color);
      color: var(--general-navbar-footer-color);
      z-index: 1;
      --app-toolbar-font-size: 14px;
      box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
    }

    #app-navbar-footer,
    #sidebar-navbar-footer {
      background-color: var(--general-navbar-footer-background-color);
    }

    #app-navbar-footer:before,
    #sidebar-navbar-footer:before {
      content: "";
      position: absolute;
      top: -1px;
      display: block;
      width: 100%;
      height: 1px;
      background-color: rgba(214, 214, 214, 0.4);
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      #main-toolbar .bar {
        /*-webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);*/
      }

      #app-navbar-footer,
      #sidebar-navbar-footer {
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);
      }

      #app-navbar-footer,
      #sidebar-navbar-footer {
        border: 0px none;
      }

      #app-navbar-footer:before,
      #sidebar-navbar-footer:before {
        content: "";
        position: absolute;
        top: -1px;
        display: block;
        width: 100%;
        height: 1px;
        background-color: rgba(214, 214, 214, 0.4);
      }
    }

    .item paper-header-panel {
      width: 280px;
      height: 280px;
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

    paper-checkbox {
      display: block;
      margin-bottom: 40px;
    }

    iron-icon.tiny {
      --iron-icon-height: 12px;
      --iron-icon-width: 12px;
    }

    wl-card {
      display: block;
      background: white;
      box-sizing: border-box;
      margin: 16px;
      padding: 0;
      border-radius: 2px;
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

      #app-navbar-footer {
        display: flex;
      }

      #sidebar-navbar-footer {
        border-top: 1px solid #eeeeee;
        background-color: var(--general-navbar-footer-background-color);
        color: var(--general-sidebar-navbar-footer-color);
      }
    }

    @media screen and (min-width: 450px) {
      #content > wl-card,
      #content > div {
        width: 95%;
      }

      #app-navbar-footer {
        display: none;
      }

      #sidebar-navbar-footer {
        border-top: 1px solid var(--general-sidebar-background-color);
        background-color: var(--general-sidebar-background-color);
        color: var(--general-sidebar-color);
      }
    }

    @media screen and (max-width: 899px) {
      .item div.layout {
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
      }
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

    .panels wl-card {
      width: var(--general-panel-width);
    }

    .wide-panels {
      margin: 0 0 10px 0;
    }

    .wide-panels wl-card {
      width: 100%;
      margin: 0 0 16px 0;
    }

    paper-dialog form {
      margin-bottom: 0;
    }

    .commands-float {
      display: block;
      position: fixed;
      text-align: right;
      min-width: 250px;
      -webkit-overflow-scrolling: touch;
      -ms-overflow-style: none;
      overflow: -moz-scrollbars-none;
      bottom: 52px;
      right: 12px;
      z-index: 10;
    }

    .commands-float::-webkit-scrollbar {
      display: none;
    }

    .commands-float a {
      display: block;
      margin: 5px;
      display: -ms-inline-flexbox;
      display: -webkit-inline-flex;
      display: inline-flex;
      -ms-flex-align: center;
      -webkit-align-items: center;
      align-items: center;
      -ms-flex-pack: center;
      -webkit-justify-content: center;
      justify-content: center;
      margin-left: auto;
    }

    .commands-float a > span {
      margin-top: 0;
      padding: 3px 5px 3px 5px;
      margin-right: 15px;
      border-radius: 5px;
      background: rgba(225, 225, 225, 0.5);
    }

    .backbutton-float {
      display: block;
      position: fixed;
      text-align: left;
      bottom: 12px;
      left: 12px;
      z-index: 20;
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

    .icon-box {
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -ms-flex-direction: row;
      -webkit-flex-direction: row;
      flex-direction: row;
    }

    .icon-box iron-icon {
      width: 24px;
      margin-top: 2px;
    }

    .icon-box p {
      -ms-flex: 1 1 0.000000001px;
      -webkit-flex: 1;
      flex: 1;
      -webkit-flex-basis: 0.000000001px;
      flex-basis: 0.000000001px;
      margin: 0;
      padding: 5px;
    }

    paper-listbox.sidebar {
      cursor: pointer;
      color: var(--general-sidebar-color, #eeeeee);;
    }

    paper-listbox.sidebar a.iron-selected paper-item {
      color: var(--general-sidebar-selected-color, #eeeeee);
      background: var(--general-sidebar-selected-background-color, #23252b);
      border-left: var(--general-sidebar-selected-border-left);
      padding-left: 11px;
      border-right: 0;
      padding-right: 11px;
      font-weight: 900;
    }

    paper-toolbar span.welcome {
      margin-right: 30px;
      color: var(--general-menu-color);
    }

    paper-toolbar a {
      color: var(--general-menu-color);
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

    .activity-counter {
      text-align: center;
    }

    lablup-activity-panel div[slot="message"] small {
      display: block;
      font-size: 10px;
    }

    lablup-activity-panel div[slot="message"] a {
      color: #2196f3;
    }

    lablup-activity-panel div[slot="message"] paper-button {
      margin-top: 10px;
      margin-bottom: 0;
    }

    .drawer-menu paper-badge {
      --paper-badge-background: var(--paper-light-blue-50);
      --paper-badge-opacity: 0.7;
      --paper-badge-text-color: #222222;
    }

    .bar paper-badge {
      --paper-badge-background: var(--paper-light-blue-50);
      --paper-badge-opacity: 0.7;
      --paper-badge-text-color: #222222;
      z-index: 1;
      --paper-badge-margin-left: -20px;
      --paper-badge-margin-bottom: -40px;
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

    .bg-brown {
      background-color: var(--paper-brown-400);
    }

    .bg-blue-gray {
      background-color: var(--paper-blue-gray-400);
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
      color: var(--paper-orange-400) !important;
    }

    .fg.deep-orange {
      color: var(--paper-deep-orange-400) !important;
    }

    .fg.amber {
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

    .fg.brown {
      color: var(--paper-brown-400) !important;
    }

    .fg.blue-gray {
      color: var(--paper-blue-gray-400) !important;
    }

    .fg.purple {
      color: var(--paper-purple-400) !important;
    }

    .fg.deep-purple {
      color: var(--paper-deep-purple-400) !important;
    }

    /* Drawer */

    .drawer-menu .portrait-bar {
      padding-left: 0 !important;
      background-color: transparent;
      color: var(--general-sidebar-topbar-color);
      height: 80px;
      @apply --general-sidebar-topbar-shadow;
    }

    .drawer-menu a {
      color: #dddddd;
    }

    .drawer-menu iron-icon {
      margin-right: 15px;
    }

    .drawer-menu h3 {
      font-size: 12px;
      font-weight: 400;
      padding: 5px 15px;
      margin: 0;
      display: block;
      color: var(--general-sidebar-h3-color);
      border-bottom: var(--general-sidebar-h3-border-color);
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

    wl-button,
    wl-expansion {
      --font-family-serif: var(--general-font-family);
      --font-family-sans-serif: var(--general-font-family);
    }

    wl-dialog > wl-card {
      --card-elevation: 0;
    }

    wl-dialog > wl-card > section {
      margin: 5px 20px;
    }

    wl-dialog wl-title {
      border-bottom: 1px solid #cccccc;
    }

    wl-dialog wl-button.cancel {
      margin-right: 5px;
    }

    wl-dialog wl-button.ok {
      margin-right: 5px;
    }

    wl-dialog.dialog-ask {
      --dialog-min-width: 350px;
    }

    wl-dialog > wl-card > h3 {
      background-color: var(--general-dialog-background-color, #ffffff);
    }

    vaadin-grid {
      font-family: var(--general-font-family);
    }
  `;

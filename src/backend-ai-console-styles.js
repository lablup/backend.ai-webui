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
      0.95);
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
      --general-sidebar-color: #DDD;
      --general-sidebar-background-color: rgba(24, 24, 24, 1.0);
      --general-sidebar-h3-color: #424242;
      --general-sidebar-h3-border-color: 1px solid #DDD;
      --general-sidebar-topbar-background-color-3: #383E48;
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
      --general-sidebar-selected-border-left: 5px solid #2AB6F6;
      --general-sidebar-footer-color: #777777;
      --general-sidebar-navbar-footer-color: #222222;
      --general-sidebar-item-even-background-color: transparent;
      --general-sidebar-item-odd-background-color: rgba(239, 240, 242, 0.95);
      --app-drawer-width: 190px;
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
    }

    body {
      background-color: var(--general-background-color, #fafafa);
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: #222;
      margin: 0;
      overflow-x: hidden;
      word-break: keep-all;
    }

    [unresolved] {
      background-repeat: no-repeat;
      background-position: 50% 50vh;
      background-color: var(--general-background-color, #fafafa);
    }

    neon-animated-pages .iron-selected {
      position: static;
    }

    neon-animated-pages .iron-selected:not(.neon-animating) {
      position: relative;
    }

    span,
    iron-icon {
      pointer-events: none;
    }

    body,
    .fonts-loaded body {
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans KR", "Noto Sans", AppleSDGothic, NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
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
      color: #aaa;
    }

    footer a {
      color: #ccc !important;
    }

    #content {
      padding: 0 auto;
      margin: 0 auto 45px auto;
    }

    .site-name {
      text-align: center;
      margin-left: 0;
      margin-right: auto;
      line-height: 16px;
      font-size: 16px;
      font-weight: 100;
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
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
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
    }

    .welcome-username {
      text-align: center;
      margin-left: auto;
      margin-right: auto;
      font-size: 13px;
      padding-top: 13px;
      line-height: 16px;
    }

    .portrait-canvas {
      margin-left: 16px;
      padding-right: 5px;
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

    .paper-material-title {
      font-weight: 200;
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
      --app-drawer-width: 190px;
    }

    app-drawer.drawer-menu {
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
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

    .drawer-menu app-header-layout {
      background-color: var(--general-sidebar-background-color, #fafafa);
    }

    #sidebar-lectures paper-item:nth-child(even) {
      background-color: var(--general-sidebar-item-even-background-color, transparent);
    }

    #sidebar-lectures paper-item:nth-child(odd) {
      background-color: var(--general-sidebar-item-odd-background-color, transparent);
    }

    #portrait-bar {
      height: 48px;
    }

    #portrait-bar .bar {
      background-color: var(--general-sidebar-topbar-background-color);
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
      color: var(--general-sidebar-footer-color, #AAAAAA);
      background-color: var(--general-sidebar-background-color);
      margin: 0;
      padding-bottom: 5px;
      font-size: 10px;
    }

    .drawer-menu footer a {
      color: var(--general-sidebar-footer-color, #AAAAAA) !important;
    }

    #sidebar-navbar-footer {
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
      left: 0;
      right: 0;
      bottom: 120px !important; /* Workaround to prevent miscalculated height */
      text-align: center;
      width: 100%;
      height: 45px;
      border-top: 1px solid #eee;
      background-color: var(--general-navbar-footer-background-color);
      color: var(--general-sidebar-navbar-footer-color);
    }

    #app-navbar-footer {
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
      text-align: left;
      height: 245px;
      width: 100%;
      border-top: 1px solid #eee;
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
      #main-toolbar app-toolbar.bar {
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);
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

    .item paper-card {
      width: 280px;
      margin: 15px 18px;
      --paper-card-header-image-text: {
        width: 100%;
        color: #eee;
        padding-left: 10px;
        padding-right: 0;
        text-shadow: 0 0 4px #444, 0 0 8px #000;
        font-weight: 400;
        overflow-x: hidden;
      };
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

    .paper-content {
      padding: 0;
      min-height: 220px;
      max-height: 500px;
    }

    .cover {
      margin: 60px;
    }

    .blue .paper-header {
      background-color: var(--paper-light-blue-400);
    }

    .red .paper-header {
      background-color: var(--paper-red-400);
    }

    .orange .paper-header {
      background-color: var(--paper-amber-400);
    }

    .green .paper-header {
      background-color: var(--paper-green-400);
    }

    .cyan .paper-header {
      background-color: var(--paper-cyan-400);
    }

    .lime .paper-header {
      background-color: var(--paper-lime-400);
    }

    .pink .paper-header {
      background-color: var(--paper-pink-a200);
    }

    .blue .paper-content {
      background: linear-gradient(white, #b3e5fc);
    }

    .red .paper-content {
      background: linear-gradient(white, #ffcdd2);
    }

    .orange .paper-content {
      background: linear-gradient(white, #ffecb3);
    }

    .green .paper-content {
      background: linear-gradient(white, #c8e6c9);
    }

    .cyan .paper-content {
      background: linear-gradient(white, #b2ebf2);
    }

    .lime .paper-content {
      background: linear-gradient(white, #f0f4c3);
    }

    .pink .paper-content {
      background: linear-gradient(white, #f8bbd0);
    }

    paper-checkbox {
      display: block;
      margin-bottom: 40px;
    }

    paper-checkbox.blue {
      --paper-checkbox-checked-color: var(--paper-light-blue-400);
      --paper-checkbox-checked-ink-color: var(--paper-light-blue-400);
      --paper-checkbox-unchecked-color: var(--paper-light-blue-900);
      --paper-checkbox-unchecked-ink-color: var(--paper-light-blue-900);
    }

    paper-checkbox.red {
      --paper-checkbox-checked-color: var(--paper-red-400);
      --paper-checkbox-checked-ink-color: var(--paper-red-400);
      --paper-checkbox-unchecked-color: var(--paper-red-900);
      --paper-checkbox-unchecked-ink-color: var(--paper-red-900);
    }

    paper-checkbox.green {
      --paper-checkbox-checked-color: var(--paper-green-400);
      --paper-checkbox-checked-ink-color: var(--paper-green-400);
      --paper-checkbox-unchecked-color: var(--paper-green-900);
      --paper-checkbox-unchecked-ink-color: var(--paper-green-900);
    }

    paper-checkbox.orange {
      --paper-checkbox-checked-color: var(--paper-orange-400);
      --paper-checkbox-checked-ink-color: var(--paper-orange-400);
      --paper-checkbox-unchecked-color: var(--paper-orange-900);
      --paper-checkbox-unchecked-ink-color: var(--paper-orange-900);
    }

    iron-icon.tiny {
      --iron-icon-height: 12px;
      --iron-icon-width: 12px;
    }

    paper-material,
    plastic-material {
      display: block;
      background: white;
      box-sizing: border-box;
      margin: 16px;
      padding: 0;
      border-radius: 2px;
    }

    .setting-detail paper-material {
      margin: 16px 8px 16px 16px !important;
    }

    .setting-detail #price-container paper-input {
      --paper-input-container-input: {
        max-width: 100px;
      }
    }

    #content > paper-material,
    #content > plastic-material,
    #content > iron-pages,
    #content > iron-lazy-pages {
      max-width: var(--general-content-container-width, 980px);
    }

    @media screen and (max-width: 399px) {
      paper-material,
      plastic-material {
        margin-left: 0;
        margin-right: 0;
      }
    }

    @media screen and (max-width: 449px) {
      #content > paper-material,
      #content > plastic-material,
      #content > iron-pages,
      #content > iron-lazy-pages {
        width: 100%;
      }

      #app-navbar-footer {
        display: flex;
      }

      #sidebar-navbar-footer {
        border-top: 1px solid #eee;
        background-color: var(--general-navbar-footer-background-color);
        color: var(--general-sidebar-navbar-footer-color);
      }
    }

    @media screen and (min-width: 450px) {
      #content > paper-material,
      #content > plastic-material,
      #content > div,
      #content > iron-lazy-pages {
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

    paper-material p,
    plastic-material p {
      padding: 10px;
    }

    paper-material > .entry > p,
    plastic-material > .entry > p {
      padding: 5px;
    }

    plastic-material .commands,
    paper-material .commands {
      margin: 0;
      border-top: 1px solid #ddd;
      text-align: left;
    }

    paper-material.item div.items,
    plastic-material.item div.items {
      padding-bottom: 10px;
    }

    paper-material .commands.float,
    plastic-material .commands.float {
      border-top: none;
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
    }

    paper-material .commands a {
      display: inline-block;
      margin: 5px;
    }

    paper-material .commands paper-fab {
      display: inline-block;
      margin: 5px;
    }

    .panels paper-material,
    .panels plastic-material {
      width: var(--general-panel-width);
    }

    .wide-panels {
      margin: 0 0 10px 0;
    }

    .wide-panels paper-material,
    .wide-panels plastic-material {
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

    .commands-float a > span,
    .commands-float a > paper-fab {
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
      background-color: var(--general-sidebar-background-color, #fafafa);
      color: var(--general-sidebar-color, #eeeeee);;
    }

    paper-listbox.sidebar a.iron-selected paper-item {
      color: var(--general-sidebar-selected-color, #eeeeee);
      background: var(--general-sidebar-selected-background-color, #23252B);
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

    paper-tabs {
      background-color: var(--paper-grey-800);
      color: #fff;
      box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
    }

    paper-tabs a {
      color: #fff;
    }

    paper-toolbar paper-tabs {
      box-shadow: none;
    }

    paper-tabs[noink][no-bar] paper-tab.iron-selected {
      color: #ffff8d;
    }

    paper-tabs[alignBottom] {
      box-shadow: 0px -2px 6px rgba(0, 0, 0, 0.15);
    }

    paper-tab {
      width: 130px;
    }

    paper-tabs.sidebar-selector {
      background-color: var(--general-sidebar-topbar-background-color, var(--general-menu-background-color));
      color: var(--general-sidebar-topbar-color, #434854);
      --paper-tabs-selection-bar-color: var(--paper-light-blue-a400);
    }

    paper-tabs.file-tabs {
      background-color: var(--paper-grey-700);
      --paper-tabs-selection-bar-color: var(--paper-light-green-400);
    }

    paper-tabs.file-tabs paper-tab {
      width: 150px;
      max-width: 200px;
    }

    paper-tabs.file-tabs paper-tab.add-file-button {
      width: 40px;
    }

    paper-tabs.file-tabs paper-tab.iron-selected,
    paper-tabs.file-tabs a.iron-selected {
      color: #ffffff !important;
    }

    paper-fab {
      display: block;
      margin-left: auto;
      margin-right: auto;
      border-radius: 35% !important;
    }

    paper-fab.blue {
      --paper-fab-background: var(--paper-light-blue-500);
    }

    paper-fab.red {
      --paper-fab-background: var(--paper-red-500);
    }

    paper-fab.yellow {
      --paper-fab-background: var(--paper-yellow-500);
    }

    paper-fab.green {
      --paper-fab-background: var(--paper-green-500);
    }

    paper-fab.orange {
      --paper-fab-background: var(--paper-orange-500);
    }

    paper-fab.lime {
      --paper-fab-background: var(--paper-lime-500);
    }

    paper-fab.grey {
      --paper-fab-background: var(--paper-grey-300);
    }

    paper-fab.command-button {
      --paper-fab-background: var(--paper-light-blue-500);
    }

    paper-fab.back-button {
      --paper-fab-background: var(--paper-green-500);
    }

    paper-tab .badge {
      font-size: 12px;
      padding-left: 10px;
    }

    paper-material > h3,
    plastic-material > h3 {
      font-size: 20px;
      font-weight: 200;
      padding: 10px 20px;
      margin: 0;
      display: block;
      border-bottom: 1px solid #DDD;
    }

    paper-material > h3 > .date,
    plastic-material > h3 > .date {
      font-size: 12px;
      text-align: right;
      color: #888;
      margin-left: 20px;
    }

    paper-material > h3.blue,
    paper-material > h4.blue,
    plastic-material > h3.blue,
    plastic-material > h4.blue {
      border-left: 3px solid var(--paper-light-blue-400);
    }

    paper-material > h3.red,
    paper-material > h4.red,
    plastic-material > h3.red,
    plastic-material > h4.red {
      border-left: 3px solid var(--paper-red-400);
    }

    paper-material > h3.green,
    paper-material > h4.green,
    plastic-material > h3.green,
    plastic-material > h4.green {
      border-left: 3px solid var(--paper-green-400);
    }

    paper-material > h3.orange,
    paper-material > h4.orange,
    plastic-material > h3.orange,
    plastic-material > h4.orange {

      border-left: 3px solid var(--paper-orange-400);
    }

    paper-material > h3.cyan,
    paper-material > h4.cyan,
    plastic-material > h3.cyan,
    plastic-material > h4.cyan {

      border-left: 3px solid var(--paper-cyan-400);
    }

    paper-material > h3.lime,
    paper-material > h4.lime,
    plastic-material > h3.lime,
    plastic-material > h4.lime {
      border-left: 3px solid var(--paper-lime-400);
    }

    paper-material > h3.pink,
    paper-material > h4.pink,
    plastic-material > h3.pink,
    plastic-material > h4.pink {
      border-left: 3px solid var(--paper-pink-400);
    }

    paper-material > h4,
    plastic-material > h4 {
      font-size: 14px;
      padding: 5px 15px 5px 20px;
      margin: 0 0 10px 0;
      display: block;
      border-bottom: 1px solid #DDD;
      -ms-flex-pack: justify;
      -webkit-justify-content: space-between;
      justify-content: space-between;
    }

    paper-material .flex,
    plastic-material .flex {

      display: flex;
    }

    paper-material > div,
    plastic-material > div {
      margin: 10px;
    }

    paper-material.entries > div,
    plastic-material.entries > div {
      margin: 20px;
    }

    paper-material paper-card,
    plastic-material paper-card {
      margin-top: 15px;
      margin-bottom: 15px;
    }

    paper-toolbar {
      --paper-toolbar-sm-height: 45px;
    }

    .user-profile paper-card {
      text-align: center;
      --paper-card-header-image-text: {
        font-size: 18px;
        color: #ffffff;
        text-align: center;
        width: 100%;
        padding-left: 0;
        padding-right: 0;
        text-shadow: 0 0 4px #bbbbbb, 0 0 8px #000;
        font-weight: 100;
        background: linear-gradient(to bottom, rgba(25, 25, 25, 0.5), rgba(25, 25, 25, 0.3), rgba(25, 25, 25, 0.1));
      };
    }

    .author-card paper-card {
      text-align: center;
      margin: 0;
      --paper-card-header-image-text: {
        font-size: 12px;
        color: #ffffff;
        text-align: center;
        width: 100%;
        padding-left: 0;
        padding-right: 0;
        text-shadow: 0 0 4px #bbbbbb, 0 0 8px #000;
        font-weight: 100;
        background: linear-gradient(to bottom, rgba(25, 25, 25, 0.5), rgba(25, 25, 25, 0.3), rgba(25, 25, 25, 0.1));
      };
    }

    .activity-counter {
      text-align: center;
    }

    lablup-activity-panel div[slot="message"] small {
      display: block;
      font-size: 10px;
    }

    lablup-activity-panel div[slot="message"] a {
      color: #2196F3;
    }

    lablup-activity-panel div[slot="message"] paper-button {
      margin-top: 10px;
      margin-bottom: 0;
    }

    lablup-search-objects {
      right: 0 !important;
    }

    lablup-course-item {
      margin: 15px;
    }

    #circle lablup-circle {
      margin-left: 10px;
      margin-right: 10px;
    }

    .activity-counter section {
      margin-left: 10px;
      margin-right: 10px;
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

    .fg.cyan {
      color: var(--paper-cyan-400) !important;
    }

    .fg.lime {
      color: var(--paper-lime-400) !important;
    }

    .fg.pink {
      color: var(--paper-pink-a200) !important;
    }

    /* Drawer */

    .drawer-menu app-header {
      padding-left: 0 !important;
      background-color: transparent;
      color: var(--general-sidebar-topbar-color);
      height: 80px;
      @apply --general-sidebar-topbar-shadow;
    }

    .drawer-menu a {
      color: #DDD;
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

    /* Part-specific UI customizations */
    #activity paper-material > h3,
    #activity paper-material > h4 {
      border-left: 3px solid var(--paper-yellow-400);
    }

    #circle paper-material > h3,
    #circle paper-material > h4 {
      border-left: 3px solid var(--paper-lime-400);
    }

    #course paper-material > h3,
    #course paper-material > h4 {
      border-left: 3px solid var(--paper-blue-400);
    }

    #bookmark paper-material > h3,
    #bookmark paper-material > h4 {
      border-left: 3px solid var(--paper-red-400);
    }

    #my_entry paper-material > h3,
    #my_entry paper-material > h4 {
      border-left: 3px solid var(--paper-red-400);
    }

    #user_preference paper-material > h3 {
      border-left: 3px solid var(--paper-green-400);
    }

    paper-material > h4 {
      font-weight: 200;
    }

    #sandbox paper-material > h3,
    #sandbox paper-material > h4 {
      border-left: 3px solid var(--paper-blue-700);
    }

    #sandbox .sidebar-controls paper-input,
    #sandbox .sidebar-controls paper-textarea,
    #sandbox .sidebar-controls paper-dropdown-menu {
      --paper-input-container-color: #424242;
      --paper-input-container-focus-color: #F98F23;
      --paper-input-container-input-color: #242424;
    }

    #sandbox .sidebar-controls paper-slider {
      width: 170px;
      --paper-slider-container-color: #424242;
      --paper-slider-active-color: #F98F23;
      --paper-slider-font-color: #242424;
    }

    #sandbox .sidebar-controls {
      color: #242424;
    }

    #comment-list paper-material {
      padding-bottom: 5px !important;
    }

    #comment-list paper-material p {
      padding: 0;
      margin: 0;
    }

    #activity paper-material > paper-material {
      max-width: 480px;
    }

    #activity paper-material .download {
      width: 280px;
    }

    #activity paper-material .download paper-button {
      margin-top: 0;
      margin-bottom: 0;
    }

    #activity lablup-shields {
      margin-right: 5px;
    }

    #summary lablup-shields {
      margin-right: 5px;
    }

    paper-material.setting .name {
      width: 300px;
    }

    .setting paper-toggle-button,
    .setting paper-range-slider {
      margin-left: 16px;
    }

    #billing .billing paper-header-panel {
      width: 250px;
      min-height: 550px;
      margin: 15px;
      @apply --shadow-elevation-2dp;
    }

    #billing .billing paper-header-panel .paper-header {
      text-align: center;
    }

    #billing .billing paper-header-panel.selected {
      border: 5px solid rgba(220, 0, 0, 0.5);
    }

    #billing .paper-header {
      height: 50px;
      line-height: 50px;
    }

    #billing .paper-header.medium-tall {
      height: 80px;
      line-height: 40px;
    }

    #billing .billing paper-header-panel .content {
      padding: 15px;
      height: 330px;
    }

    #billing .billing paper-header-panel .content .includes {
      height: 150px;
    }

    #billing .billing paper-header-panel paper-button.price {
    }

    #billing paper-card .coupon-header {
      @apply --paper-font-headline;
    }

    #billing paper-card .coupon-credit {
      vertical-align: middle;
    }

    #course .card-actions-item {
      padding-right: 15px;
    }

    #course .card-actions-item span {
      display: block;
      height: 25px;
      line-height: 25px;
    }

    #user_preference paper-item.name,
    #billing paper-item.name {
      width: 350px;
    }

    #user_preference paper-item.name div {
      overflow-y: scroll;
      text-overflow: inherit;
      white-space: normal;
    }

    #user_preference .plan {
    }

    #user_preference .plan > div {
      display: inline-block;
      vertical-align: middle;
    }

    #user_preference .plan > .current-plan {
      width: 90px;
      height: 90px;
      margin: 0;
      padding: 0;
      line-height: 90px;
      text-align: center;
    }

    #user_preference .plan > .current-detail {
      margin: 0;
      padding: 15px;
    }

    #user_preference .current-detail > div > span.title {
      display: inline-block;
      margin-right: 5px;
      margin-bottom: 5px;
    }

    #user_preference .current-detail > div > span.count {
      font-size: 9px;
    }

    #user_preference .current-detail .entry > paper-progress {
      width: 100%;
      margin-bottom: 15px;
      --paper-progress-active-color: #e91e63;
    }

    #user_preference .current-detail .circle > paper-progress {
      width: 100%;
      margin-bottom: 15px;
      --paper-progress-active-color: var(--paper-lime-400);
    }

    #user_preference .current-detail .course > paper-progress {
      width: 100%;
      margin-bottom: 10px;
      --paper-progress-active-color: var(--paper-blue-400);
    }

    #user_preference .payment-history paper-item {
      font-size: inherit;
      --paper-item-min-height: 30px;
    }

    #user_preference #username-form fieldset div {
      margin: 0 0 5px 0;
    }

    #user_preference #username-form .warning {
      color: var(--paper-red-400);
    }

    #user_type paper-header-panel {
      width: 250px;
      min-height: 400px;
      margin: 15px;
      @apply --shadow-elevation-8dp;
    }

    #user_type paper-header-panel .paper-header {
      text-align: center;
    }

    #user_type paper-header-panel.selected {
      @apply --shadow-elevation-2dp;
    }

    #user_type paper-header-panel .content {
      padding: 15px;
      height: 280px;
    }

    #user_type paper-header-panel .content .role {
      height: 100px;
    }

    /* Comment form */
    #commentForm paper-button {
      font-size: inherit;
      --paper-button: {
        margin: 0;
      }
    }

    #commentForm paper-textarea {
      --paper-input-container: {
        padding: 0;
      }
      --paper-input-container-input: {
        font-size: inherit;
      }
    }

    /* Entry */
    paper-material.comment-card .name-tag {
      display: inline-block;
      width: 150px;
      text-align: center;
      min-height: 80px;
      overflow: hidden;
    }

    .admonition paper-button {
      height: 40px;
    }

    .access-list paper-item {
      font-size: inherit;
      height: 60px;
      --paper-item-min-height: 60px;

    }

    .access-list paper-dropdown-menu {
      --paper-dropdown-menu: {
        width: 90px;
      };
      --paper-input-container-input: {
        font-size: inherit;
        text-align: center;
      };
    }

    .access-list #people-to-be-invited paper-icon-button {
      width: 20px;
      height: 20px;
      padding-top: 2px;
      padding-left: 2px;
      margin-left: -10px;
      margin-right: 5px;
    }

    .access-list .invite-people-container #input-invite {
      --paper-input-container: {
        padding: 0;
      };
      --paper-input-container-label: {
        font-size: inherit;
      };
      --paper-input-container-input: {
        font-size: inherit;
      };
    }

    .access-list .invite-people-container #btn-add-invitee {
      padding: 0;
      padding-top: 1px;
      padding-left: 2px;
      margin: 4px 0;
      width: 24px;
      height: 24px;
    }

    .access-list .invite-people-container #btn-send-invitation {
      border: 1px #ccc solid;
      padding: 5px 0;
      margin: 0;
      margin-left: 8px;
      min-width: 50px;
    }

    .access-list #people-to-be-invited paper-icon-button::shadow #icon {
      width: 16px;
      height: 16px;
    }

    /* File-upload */
    #entry .uploadArea,
    #notice .uploadArea {
      margin: 0 0 20px 0;
      height: 80px;
      border-radius: 5px;
      padding-bottom: 0;
      border: 2px dotted #ccc;
    }

    /* CodeRunner */
    ingen-dino-cage .CodeMirror,
    .sandbox .CodeMirror,
    .content-textarea .CodeMirror {
      z-index: 0 !important;
    }

    .cm-ingen-code {
      font-family: "Roboto Mono", Consolas, Menlo, monospace;
    }

    .cm-comment {
      font-family: "Roboto Mono", Consolas, Menlo, monospace;
    }

    .entry ingen-dino-cage pre,
    ingen-dino-lab pre {
      margin: 0;
      background: transparent;
    }

    ingen-dino-cage paper-button {
      margin-bottom: 24px;
    }

    #user_preference #cover-image lablup-coverimage-list {
      --coverimage-list-theme: {
        height: 220px !important;
        width: 220px !important;
      };
      --file-theme: {
        height: 220px !important;
        width: 220px !important;
      };
      --iron-image-theme: {
        height: 220px !important;
        width: 220px !important;
      };
      --delete-button-theme: {
        top: -35px;
        right: 9px;
      };
    }

    /* Loading spinner */
    #lablup-loading-spinner {
      position: fixed;
      width: 30px;
      height: 30px;
      bottom: 6px;
      left: 6px;
      z-index: 1000;
      --paper-spinner-stroke-width: 6px;
    }

    /* Toast */
    paper-toast {
      z-index: 25;
    }

    paper-toast paper-icon-button {
      display: inline-block;
      color: #ffffff;
    }

    /* Dino cage */
    ingen-dino-cage,
    ingen-dino-lab {
      z-index: 0;
    }

    /* Sandbox code runner */
    /* Dino cage */
    .sandbox.embed ingen-dino-cage {
      z-index: 0;
      --ingen-dino-cage-result-console-color: #222;
      --ingen-dino-cage-result-console-background-color: transparent;
      --ingen-dino-cage-error-console-color: #d32f2f;
      --ingen-dino-cage-error-console-background-color: rgba(255, 235, 239, 0.5);
    }

    .sandbox.embed ingen-dino-cage #result-console-control {
      position: fixed;
      margin-bottom: 0 !important;
      bottom: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.7);
    }

    .sandbox ingen-dino-cage pre {
      margin: 0;
      background: transparent;
    }
  `;

import { BackendAiStyles } from './backend-ai-general-styles';
import { css } from 'lit';

export const BackendAIWebUIStyles = [
  BackendAiStyles,
  // language=CSS
  css`
    .loading-background {
      transition: all 0.3s linear;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      /* background-image: url('/resources/images/loading-background-large.jpg'); */
      /* background-repeat: no-repeat; */
      /* background-attachment: fixed; */
      /* background-position: top left; */
      -webkit-user-select: none !important;
      z-index: 1;
    }

    .loading-background::before {
      content: '';
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-image: url('/resources/images/loading-background-large.jpg');
      z-index: -1;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-position: top left;
      filter: var(--theme-image-filter);
    }

    .loading-background-drag-area {
      position: absolute;
      background-color: transparent;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      -webkit-app-region: drag !important;
    }

    .loading-background[inactive] {
      display: none;
    }

    .hidden {
      display: none;
    }

    .visuallyhidden {
      opacity: 0;
    }

    mwc-top-app-bar-fixed {
      --mdc-typography-headline6-font-family: var(--token-fontFamily);
      --mdc-typography-font-family: var(--token-fontFamily);
    }

    .site-name {
      text-align: center;
      margin-left: 0;
      margin-right: auto;
      line-height: 16px;
      font-size: 16px;
      font-weight: 100;
      color: var(--general-sidebar-topbar-color, #efefef);
      font-family: var(--token-fontFamily);
    }

    .site-name > .bold {
      font-weight: 400;
    }

    .mini-ui .site-name {
      display: none;
    }

    .vertical-line {
      width: 1px; /* Line width */
      background-color: #dbdbdb; /* Line color */
      height: 100%;
      float: left;
      margin-top: 10px;
    }

    .drawer-menu {
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overflow: -moz-scrollbars-none;
      -ms-overflow-style: none;
      will-change: transform;
      background-color: var(--general-background-color, #fafafa);
      scrollbar-width: none;
    }

    .drawer-menu .portrait-bar {
      padding-left: 0 !important;
      background-color: transparent;
      color: var(--general-sidebar-topbar-color);
      height: 80px;
      max-width: 250px; /* prevent sidebar from expanding over its width limit */
    }

    .drawer-menu h3 {
      height: 12px;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      padding: 5px 15px 10px 0;
      margin: 20px 25px 20px 25px;
      display: block;
      color: var(--general-sidebar-h3-color);
      border-bottom: var(--general-sidebar-h3-border-color);
    }

    #sidebar-menu {
      height: calc(100vh - 280px);
    }

    .mini-ui #sidebar-menu {
      height: calc(100vh - 226px) !important;
    }

    mwc-list.sidebar {
      cursor: pointer;
      color: var(--general-sidebar-color, #949494);
      --mdc-list-side-padding: 32px;
    }

    mwc-list.sidebar mwc-list-item {
      --mdc-theme-primary: var(--general-sidebar-selected-color, #949494);
      --mdc-theme-text-primary-on-background: var(
        --general-sidebar-color,
        #949494
      );
      --mdc-list-item-graphic-margin: 15px;
      height: 36px;
      margin-top: 10px;
      margin-bottom: 10px;
      font-size: 14px;
    }

    mwc-list.sidebar mwc-list-item i {
      color: #949494;
      font-size: 17px;
      padding-top: 5px;
    }

    mwc-list.sidebar mwc-list-item[disabled] i {
      color: rgb(70, 70, 70);
    }

    mwc-list.sidebar mwc-list-item[selected] {
      color: var(--general-sidebar-selected-color, #949494);
      background: var(--general-sidebar-selected-background-color, #23252b);
      border-left: var(--general-sidebar-selected-border-left);
      padding-left: 29px; /* 32px - 3px */
      border-right: 0;
      padding-right: 11px;
      font-weight: 900;
    }

    mwc-list.sidebar mwc-list-item[selected] > i {
      color: inherit;
    }

    mwc-list.sidebar mwc-list-item[disabled],
    mwc-list.sidebar mwc-list-item[disabled] mwc-icon {
      --mdc-theme-on-surface: #888888;
      color: #888888 !important;
    }

    .mini-ui mwc-list.sidebar mwc-list-item {
      --mdc-list-item-graphic-margin: 0;
    }

    #app-body {
      --mdc-drawer-background-color: var(--general-background-color, #fafafa);
      --mdc-drawer-border-left: 0;
      --mdc-drawer-border-right: 0;
    }

    app-drawer-layout:not([narrow]) [drawer-toggle] {
      display: none;
    }

    .drawer-menu footer,
    footer#short-height {
      bottom: 0;
      color: var(--general-sidebar-footer-color, #aaaaaa);
      background-color: var(--general-background-color);
      margin: 0;
      padding-bottom: 5px;
      line-height: 1;
      font-size: 10px;
    }

    .drawer-menu footer a,
    footer#short-height a {
      color: var(--general-sidebar-footer-color, #aaaaaa) !important;
    }

    .user-name {
      max-width: 15vw;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #project {
      font-size: 12px;
      color: #8c8484;
      padding-right: 8px;
    }

    mwc-menu#dropdown-menu {
      position: relative;
      left: 170px;
      top: 20px;
    }

    .dropdown-menu-name {
      position: absolute;
      margin-top: 3px;
    }

    mwc-button {
      margin: auto 10px;
      background-image: none;
      --mdc-theme-primary: var(--general-button-background-color);
      --mdc-theme-on-primary: var(--general-button-color);
    }

    mwc-button[unelevated] {
      --mdc-theme-primary: var(--token-colorPrimary);
      --mdc-theme-on-primary: var(--token-colorWhite, --general-button-color);
    }

    mwc-button.full {
      width: 100%;
    }

    .page {
      display: none;
    }

    .page[active] {
      display: block;
    }

    .sidepanel {
      display: none;
    }

    .sidepanel[active] {
      display: block;
    }

    #content-body {
      background-color: var(--general-background-color, #ffffff);
      color: var(--general-sidepanel-color, #fafafa);
      --mdc-drawer-background-color: var(
        --sidepanel-background-color,
        var(--general-sidepanel-background-color, #fafafa)
      );
    }

    .sidepanel-drawer {
      border-right: 1px solid var(--token-colorBorder, #ccc);
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overflow: -moz-scrollbars-none;
      -ms-overflow-style: none;
      will-change: transform;
    }

    mwc-circular-progress {
      width: 48px;
      height: 48px;
      position: fixed;
      --mdc-theme-primary: #e91e63;
      top: calc(50vh - 24px);
    }

    @media screen and (max-width: 899px) {
      mwc-circular-progress {
        left: calc(50% - 24px);
      }
    }

    @media screen and (min-width: 900px) {
      mwc-circular-progress {
        left: calc(50% + 71px);
      }

      .mini-ui mwc-circular-progress {
        left: calc(50% + 29px);
      }
    }

    .draggable {
      -webkit-user-select: none !important;
      -webkit-app-region: drag !important;
    }

    .drawer-menu footer,
    footer#short-height {
      width: 250px;
    }

    mwc-tab {
      color: var(--token-colorPrimary, #ffffff);
    }

    mwc-menu {
      font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-family: var(--token-fontFamily);
    }

    mwc-formfield {
      --mdc-typography-body2-font-family: var(--token-fontFamily);
    }

    span.full_name,
    mwc-select {
      font-weight: bold;
    }

    mwc-multi-select {
      width: 135px;
      min-width: 135px;
      font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-size: 14px;
      --mdc-typography-subtitle1-font-color: white;
      --mdc-typography-subtitle1-font-weight: 400;
      --mdc-typography-subtitle1-line-height: 16px;
      --mdc-theme-primary: rgba(255, 255, 255, 1);
      --mdc-select-idle-line-color: transparent;
      --mdc-select-hover-line-color: transparent;
      --mdc-select-outlined-idle-border-color: rgba(255, 255, 255, 0.42);
      --mdc-select-outlined-hover-border-color: rgba(255, 255, 255, 0.87);
      --mdc-select-outlined-disabled-border-color: rgba(255, 255, 255, 0.87);
      --mdc-select-fill-color: transparent;
      --mdc-select-disabled-fill-color: transparent;
      --mdc-select-ink-color: rgba(255, 255, 255, 1);
      --mdc-select-label-ink-color: rgba(255, 255, 255, 1);
      --mdc-select-focused-label-color: rgba(24, 24, 24, 1);
      --mdc-select-disabled-ink-color: rgba(255, 255, 255, 1);
      --mdc-select-dropdown-icon-color: rgba(255, 255, 255, 1);
      --mdc-select-focused-dropdown-icon-color: rgba(255, 255, 255, 0.42);
      --mdc-select-disabled-dropdown-icon-color: rgba(255, 255, 255, 0.87);
      --mdc-theme-surface: white;
      --mdc-list-side-padding: 10px;
      --mdc-menu-item-height: 28px;
      --mdc-list-item__primary-text: {
        height: 20px;
        color: #222222;
      };
      --mdc-select-min-width: 100px;
    }

    mwc-list-item[activated] {
      color: black;
      background-color: #e1e1e1;
    }

    mwc-list-item > mwc-icon {
      font-size: 20px;
      margin: 5px;
    }

    mwc-icon.dropdown-menu {
      color: #242424;
      padding-right: 10px;
    }

    mwc-textfield {
      width: 100%;
    }

    #user-preference-dialog mwc-textfield#secretkey {
      --mdc-typography-subtitle1-font-size: 0.7rem;
    }

    mwc-textarea {
      width: 100%;
    }

    mwc-list-item {
      font-family: var(--token-fontFamily);
      --mdc-typography-subtitle1-font-family: var(--token-fontFamily);
      --mdc-typography-body2-font-family: var(--token-fontFamily);
      font-weight: 400;
    }

    a.email:hover {
      color: #29b6f6;
    }

    mwc-menu.user-menu {
      --mdc-menu-item-height: 28px;
      --mdc-menu-min-width: 200px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    }

    mwc-menu.user-menu mwc-list-item {
      font-size: 14px;
    }

    mwc-icon-button.side-menu {
      --mdc-icon-button-size: 44px;
      --mdc-theme-text-disabled-on-light: var(--paper-grey-800);
      --mdc-ripple-focus-opacity: 0;
    }

    mwc-icon-button#mini-ui-toggle-button {
      --mdc-ripple-focus-opacity: 0;
    }

    #sidebar-navbar-footer mwc-icon-button {
      --mdc-theme-text-disabled-on-light: var(--paper-grey-800);
    }

    .mini-ui .full-menu {
      display: none;
      margin: 0 !important;
    }

    .mini-menu {
      display: none;
    }

    .mini-ui .mini-menu {
      display: block;
    }

    .sidebar-footer {
      text-align: center;
      margin-left: auto;
      margin-right: auto;
      line-height: 16px;
      font-size: 12px;
      font-weight: 100;
      font-family: var(--token-fontFamily);
    }

    .portrait-canvas {
      margin-left: 18px;
      border-radius: 8px;
      min-width: 48px; /* only apply this style feature if it's Backend.AI logo */
      width: 48px;
      height: 48px;
      background-color: #ffffff;
      background-image: url('/manifest/backend.ai-brand-simple.svg');
      background-repeat: no-repeat;
      background-size: 36px 36px;
      background-position: center center;
    }

    .mini-ui .portrait-canvas {
      margin-left: 18px;
      padding-right: 0;
    }

    .drawer-menu::-webkit-scrollbar {
      display: none !important;
      -webkit-appearance: none;
      width: 0 !important;
      height: 0;
    }

    footer#short-height {
      display: none;
    }

    #portrait-bar {
      height: 64px;
      padding-top: 15px;
    }

    #content-body {
      height: 100vh;
    }

    #main-toolbar {
      background-color: var(--general-menu-background-color);
      color: var(--general-menu-color);
      z-index: 5;
      overflow: visible;
      --mdc-theme-on-primary: black;
      --mdc-theme-primary: rgba(247, 246, 246, 1);
      border-bottom: 1px solid var(--token-colorBorder, #ccc);
      position: sticky;
    }

    #main-toolbar > p {
      padding: 10px;
      margin: auto;
      font-size: 14px;
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #090909;
    }

    #content {
      padding-top: 0;
    }

    #sidebar-navbar-footer {
      right: 0;
      left: 0;
      bottom: 0 !important; /* Workaround to prevent miscalculated height */
      text-align: center;
      height: 100px;
      background-color: var(--general-navbar-footer-background-color);
      color: var(--general-sidebar-navbar-footer-color);
    }

    #password-change-request {
      background-color: var(--paper-orange-400);
      color: white;
      font-size: 14px;
      height: 28px;
      position: absolute;
      right: 0;
      width: 100vw;
    }

    #password-change-request > mwc-icon-button > i {
      font-size: 14px;
    }

    @supports (
      (-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))
    ) {
      #main-toolbar {
        /*-webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);*/
      }

      #sidebar-navbar-footer {
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);
        border: 0;
      }
    }

    @media screen and (max-width: 449px) {
      #sidebar-navbar-footer {
        background-color: var(--general-navbar-footer-background-color);
        color: var(--general-sidebar-navbar-footer-color);
      }
      div#center-area,
      span.email,
      span.full_name,
      span.log_out {
        display: none;
      }
      mwc-menu#dropdown-menu {
        position: relative;
        left: 12vw;
      }
      mwc-top-app-bar-fixed {
        --mdc-top-app-bar-width: 410px !important;
      }
    }

    @media screen and (max-width: 1030px) {
      span.email,
      p#project {
        display: none;
      }

      div#welcome-message {
        display: none;
      }
    }

    @media screen and (min-width: 450px) {
      #sidebar-navbar-footer {
        background-color: var(--general-background-color);
        color: var(--general-sidebar-color);
      }
    }

    @media screen and (max-height: 953px) {
      footer#short-height {
        display: block;
      }

      footer {
        display: none;
      }
    }

    .temporarily-hide {
      display: none !important;
    }
  `,
];

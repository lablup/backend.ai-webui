import '@polymer/polymer/polymer-legacy.js';
import '@polymer/paper-styles/color.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';

const template =
  // language=HTML
  html`
    <dom-module id="backend-ai-styles">
      <template>
        <style is="custom-style" include="iron-flex iron-flex-alignment iron-positioning">
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

          .wl-card-title {
            font-weight: 200;
          }

          ::-webkit-scrollbar {
            max-width: 2px;
            background-color: transparent;
          }

          ::-webkit-scrollbar-thumb {
            border-radius: 6px;
            background-color: #464646;
          }
          .item paper-header-panel {
            width: 280px;
            height: 280px;
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
          }

          @media screen and (min-width: 450px) {
            #content > wl-card {
              width: 95%;
            }
          }

          @media screen and (max-width: 899px) {
            .item div.layout {
              @apply --layout-center-justified;
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
            border-top: 1px solid #ddd;
            text-align: left;
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

          paper-tab .badge {
            font-size: 12px;
            padding-left: 10px;
          }

          wl-card > h3 {
            font-size: 20px;
            font-weight: 200;
            padding: 10px 20px;
            margin: 0;
            display: block;
            border-bottom: 1px solid #DDD;
          }

          wl-card > h3 > .date {
            font-size: 12px;
            text-align: right;
            color: #888;
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
            border-bottom: 1px solid #DDD;
            @apply --layout-justified;
          }

          wl-card .flex {
            display: flex;
          }

          wl-card > div {
            margin: 10px;
          }

          wl-card.entries > div {
            margin: 20px;
          }

          wl-card paper-card {
            margin-top: 15px;
            margin-bottom: 15px;
          }

          paper-toolbar {
            --paper-toolbar-sm-height: 45px;
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

          /* Layout */
          .flex-1-container {
            @apply --layout-flex;
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
            --paper-spinner-stroke-width: 6px;
          }

          /* Button */
          wl-button {
            --button-padding: 8px;
            --button-font-size: 14px;
          }

          wl-button,
          wl-expansion {
            --font-family-serif: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
            --font-family-sans-serif: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
          }
        </style>
      </template>
    </dom-module>`;
template.setAttribute('style', 'display:none;');
document.head.appendChild(template.content);

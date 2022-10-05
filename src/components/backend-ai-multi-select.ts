/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {css, CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import {
  IronFlex,
  IronFlexReverse,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import {BackendAiStyles} from './backend-ai-general-styles';

import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-icon-button/mwc-icon-button';
import '@material/mwc-list/mwc-list';

import '../plastics/lablup-shields/lablup-shields';

/**
 Backend.AI Multi Select

 `backend.ai-multi-select` is multi-selectable UI

 Example:

 <backend-ai-multi-select></backend-ai-multi-select>

 @group Backend.AI Web UI
 @element backend-ai-multi-select
 */

@customElement('backend-ai-multi-select')
export default class BackendAIMultiSelect extends LitElement {
  /**
   * NOTE: number used for setting size of the list items of dropdown dynamically
   */
  private static readonly DEFAULT_ITEM_HEIGHT: number = 56;
  private static readonly DEFAULT_ITEM_MARGIN: number = 25;

  public shadowRoot: any; // ShadowRoot
  @query('#list') private comboBox;
  @query('#menu', true) private menu;
  @query('#dropdown-icon', true) private dropdownIcon;
  @property({type: Array}) selectedItemList;
  @property({type: String, attribute: 'label'}) label = '';
  @property({type: Array}) items;
  // TODO: Clear button to remove all selected
  // TODO: AutoComplete(filtering)
  @property({type: Boolean, attribute: 'enable-clear-button'}) enableClearButton = false;
  @property({type: Boolean, attribute: 'open-up'}) openUp = false;

  constructor() {
    super();
    this.selectedItemList = [];
    this.items = [];
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexReverse,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        lablup-shields {
          margin: 1px;
        }

        span.title {
          font-size: var(--select-title-font-size, 14px);
          font-weight: var(--select-title-font-weight, 500);
        }

        mwc-button {
          margin: var(--selected-item-margin, 3px);
          --mdc-theme-primary: var(--selected-item-theme-color);
          --mdc-theme-on-primary: var(--selected-item-theme-font-color);
          --mdc-typography-font-family: var(--selected-item-font-family);
          --mdc-typography-button-font-size: var(--selected-item-font-size);
          --mdc-typography-button-text-transform: var(--selected-item-text-transform);
        }

        mwc-button[unelevated] {
          --mdc-theme-primary: var(--selected-item-unelevated-theme-color);
          --mdc-theme-on-primary: var(--selected-item-unelevated-theme-font-color);
        }

        mwc-button[outlined] {
          --mdc-theme-primary: var(--selected-item-outlined-theme-color);
          --mdc-theme-on-primary: var(--selected-item-outlined-theme-font-color);
        }
        
        mwc-list {
          font-family: var(--general-font-family);
          width: 100%;
          position: absolute;
          left: 0;
          right: 0;
          z-index: 1;
          border-radius: var(--select-background-border-radius);
          background-color: var(--select-background-color, #efefef);
          --mdc-theme-primary: var(--select-primary-theme);
          --mdc-theme-secondary: var(--select-secondary-theme);
          box-shadow: var(--select-box-shadow);
        }

        mwc-list > mwc-check-list-item {
          background-color: var(--select-background-color, #efefef);
        }

        .selected-area {
          background-color: var(--select-background-color, #efefef);
          border-radius: var(--selected-area-border-radius, 5px);
          border: var(--selected-area-border, 1px solid rgba(0,0,0,1));
          padding: var(--selected-area-padding, 10px);
          min-height: var(--selected-area-min-height, 24px);
          height: var(--selected-area-height, auto);
        }

        .expand {
          transform:rotateX(180deg) !important;
        }
      `
    ];
  }

  /**
   * Show Dropdown Menu
   */
  _showMenu() {
    this._modifyListPosition(this.items.length);
    this.menu.style.display = '';
  }

  /**
   * Hide Dropdown Mneu
   */
  _hideMenu() {
    this.dropdownIcon.on = false;
    this.dropdownIcon.classList.remove('expand');
    this.menu.style.display = 'none';
  }

  /**
   * Toggle visibility of dropdown menu
   *
   * @param {Event} e - Click from expand/shrink icon in right-side of selected-area
   */
  _toggleMenuVisibility(e) {
    this.dropdownIcon.classList.toggle('expand');
    if (e.detail.isOn) {
      this._showMenu();
    } else {
      this._hideMenu();
    }
  }

  /**
   * Set the position of Dropdown menu
   * Used for setting the size of dropdown menu by the number of items
   *
   * @param {number} listCount - unit for heights to go up or down
   */
  _modifyListPosition(listCount = 0) {
    const itemHeight = BackendAIMultiSelect.DEFAULT_ITEM_HEIGHT;
    const extraMargin = (listCount === this.items.length) ? BackendAIMultiSelect.DEFAULT_ITEM_MARGIN : 0;
    const totalHeight = `-${(itemHeight * listCount + extraMargin)}px`;
    if (this.openUp) {
      this.comboBox.style.top = totalHeight;
    } else {
      this.comboBox.style.bottom = totalHeight;
    }
  }

  /**
   * Update selected items(buttons) according to selected items in dropdown
   *
   * @param {Event} e - Click from list item in dropdown menu
   */
  _updateSelection(e) {
    const selectedItemIndices = [...e.detail.index];
    const selectedItems = this.comboBox.items.filter((item, index, array) => selectedItemIndices.includes(index)).map((item) => item.value);
    this.selectedItemList = selectedItems;
  }

  /**
   * Deselect items(buttons) and reflect the changes in dropdown.
   *
   * @param {Event} e - Click from selected item button in selected-area
   */
  _deselectItem(e) {
    const itemToDeselect = e.target;
    this.comboBox.selected.forEach((item, index, array) => {
      // uncheck from list
      if (item.value === itemToDeselect) {
        this.comboBox.toggle(index);
      }
    });
    this.selectedItemList = this.selectedItemList.filter((item) => item !== itemToDeselect.label);
  }

  /**
   * Deselect all selected items(buttons) and reflects the changes in selected-area
   *
   */
  _deselectAllItems() {
    this.comboBox.selected.forEach((item, index, array) => {
      this.comboBox.toggle(index);
    });
    this.selectedItemList = [];
  }

  firstUpdated() {
    this.openUp = (this.getAttribute('open-up') !== null);
    this.label = this.getAttribute('label') ?? '';
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  render() {
    // language=HTML
    return html`
    <span class="title">${this.label}</span>
    <div class="layout ${this.openUp ? `vertical-reverse` : `vertical`}">
      <div class="horizontal layout justified start selected-area center">
        <div class="horizontal layout start-justified wrap">
          ${this.selectedItemList.map((item) => html`
            <mwc-button unelevated trailingIcon label=${item} icon="close"
                @click=${(e) => this._deselectItem(e)}></mwc-button>
            `)}
        </div>
        <mwc-icon-button-toggle id="dropdown-icon" 
            onIcon="arrow_drop_down" offIcon="arrow_drop_down"
            @icon-button-toggle-change="${(e) => this._toggleMenuVisibility(e)}"></mwc-icon-button-toggle>
      </div>
      <div id="menu" class="vertical layout flex" style="position:relative;display:none;">
        <mwc-list id="list" activatable multi @selected="${(e) => this._updateSelection(e)}">
          ${this.items.map((item) => html`
            <mwc-check-list-item value=${item} ?selected="${this.selectedItemList.includes(item)}">${item}</mwc-check-list-item>
          `)}
        </mwc-list>
      </div>
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTageNameMap {
    'backend-ai-multi-select': BackendAIMultiSelect;
  }
}

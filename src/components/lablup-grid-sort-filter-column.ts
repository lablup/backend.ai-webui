/* eslint "require-jsdoc": ["error", {
  "require": {
    "MethodDefinition": false,
    "ClassDeclaration": true,
  }
}]*/
import '@vaadin/vaadin-grid/vaadin-grid-filter';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import { GridColumn } from '@vaadin/vaadin-grid/vaadin-grid-column';

/**
 * Codemirror component.
 */
class LablupGridSortFilterColumn extends GridColumn {
  private __boundOnFilterValueChanged: (e: any) => void;
  private _generateHeader: any;
  __boundOnDirectionChanged: (e: any) => void;
  direction: any;
  _filterValue: any;

  static get properties() {
    return {
      path: { type: String },
      /**
       * Text to display as the label of the column filter text-field.
       */
      header: { type: String },
      /**
       * How to sort the data.
       * Possible values are `asc` to use an ascending algorithm, `desc` to sort the data in
       * descending direction, or `null` for not sorting the data.
       * @type {GridSorterDirection | undefined}
       */
      direction: { type: String, notify: true },
    };
  }

  static get observers() {
    return [
      '_onHeaderRendererOrBindingChanged(_headerRenderer, _headerCell, path, header, _filterValue)',
      '_onHeaderRendererOrBindingChanged(_headerRenderer, _headerCell, path, header, direction)',
    ];
  }

  constructor() {
    super();
    this.__boundOnFilterValueChanged = this.__onFilterValueChanged.bind(this);
    this.__boundOnDirectionChanged = this.__onDirectionChanged.bind(this);
  }

  _defaultHeaderRenderer(root, _column) {
    let header = root.firstElementChild;
    let sorter = header ? header.firstElementChild : undefined;
    let filter = header ? header.lastElementChild : undefined;
    let textField = filter ? filter.firstElementChild : undefined;

    if (!header) {
      header = document.createElement('div');
      header.setAttribute('style', 'display: flex; flex-direction: column');

      // Create sorter header
      sorter = document.createElement('vaadin-grid-sorter');
      sorter.addEventListener('direction-changed', this.__boundOnDirectionChanged);
      header.appendChild(sorter);

      // Create filter header
      filter = document.createElement('vaadin-grid-filter');
      textField = document.createElement('vaadin-text-field');
      textField.setAttribute('slot', 'filter');
      textField.setAttribute('theme', 'small');
      textField.setAttribute('style', 'max-width: 100%;');
      textField.setAttribute('focus-target', '');
      textField.addEventListener('value-changed', this.__boundOnFilterValueChanged);
      filter.appendChild(textField);
      header.appendChild(filter);

      root.appendChild(header);
    }

    // Sorter header properties
    sorter.path = this.path;
    sorter.__rendererDirection = this.direction;
    sorter.direction = this.direction;
    sorter.textContent = this.__getHeader(this.header, this.path);

    // Filter header properties
    filter.path = this.path;
    filter.value = this._filterValue;
    textField.__rendererValue = this._filterValue;
    textField.value = this._filterValue;
    // textField.label = this.__getHeader(this.header, this.path);
  }

  _computeHeaderRenderer() {
    return this._defaultHeaderRenderer;
  }

  __onFilterValueChanged(e) {
    // Skip if the value is changed by the renderer.
    if (e.detail.value === e.target.__rendererValue) {
      return;
    }
    this._filterValue = e.detail.value;
  }

  __onDirectionChanged(e) {
    // Skip if the direction is changed by the renderer.
    if (e.detail.value === e.target.__rendererDirection) {
      return;
    }
    this.direction = e.detail.value;
    console.log('__onDirectionChanged', this.direction);
  }

  __getHeader(header, path) {
    if (header) {
      return header;
    }
    if (path) {
      return this._generateHeader(path);
    }
  }
}

customElements.define('lablup-grid-sort-filter-column', LablupGridSortFilterColumn);

export { LablupGridSortFilterColumn };
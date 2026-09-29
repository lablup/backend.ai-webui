/*
 A `<n>px` string column width — what a spacing token read through
 `useTheme().token()` looks like (`'48px'`) — must pin the column exactly like
 the number would. BAITable used to drop every string width, so such a column
 flexed with the table.
*/
import {
  renderScrollTable,
  SCROLL_COLUMNS,
} from './BAITable.scrollTestFixtures';

const firstHeaderOf = (container: HTMLElement) =>
  container.querySelector<HTMLTableCellElement>('thead th')!;

describe('BAITable px-string column width', () => {
  it('pins a "<n>px" width like the numeric width', () => {
    const numeric = firstHeaderOf(renderScrollTable().container);
    const asString = firstHeaderOf(
      renderScrollTable({
        columns: [{ ...SCROLL_COLUMNS[0], width: '120px' }, SCROLL_COLUMNS[1]],
      }).container,
    );
    expect(numeric.style.width).not.toBe('');
    expect(asString.style.width).toBe(numeric.style.width);
  });

  it('leaves a non-px string to the auto layout', () => {
    const numeric = firstHeaderOf(renderScrollTable().container);
    const percent = firstHeaderOf(
      renderScrollTable({
        columns: [{ ...SCROLL_COLUMNS[0], width: '30%' }, SCROLL_COLUMNS[1]],
      }).container,
    );
    expect(percent.style.width).not.toBe(numeric.style.width);
  });
});

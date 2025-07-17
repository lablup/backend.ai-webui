import { SorterResult } from 'antd/es/table/interface';
import _ from 'lodash';

export function transformSorterToOrderString<T = any>(
  sorter: SorterResult<T> | Array<SorterResult<T>>,
) {
  if (Array.isArray(sorter)) {
    return _.chain(sorter)
      .map((s) =>
        s.order ? `${s.order === 'descend' ? '-' : ''}${s.field}` : undefined,
      )
      .compact()
      .join(',')
      .value();
  } else {
    return sorter.order
      ? `${sorter.order === 'descend' ? '-' : ''}${sorter.field}`
      : undefined;
  }
}

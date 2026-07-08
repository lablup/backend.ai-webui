import BAIAlert, { BAIAlertProps } from './BAIAlert';
import { theme } from 'antd';
import { createStyles } from 'antd-style';
import * as _ from 'lodash-es';
import React, { ReactNode } from 'react';

export interface BAIListAlertItem {
  key?: React.Key | null;
  content: ReactNode;
}

export interface BAIListAlertProps extends Omit<BAIAlertProps, 'description'> {
  items: Array<BAIListAlertItem>;
  maxHeight?: React.CSSProperties['maxHeight'];
}

const useStyles = createStyles(({ css, token }) => ({
  // scrollbar with no track background — only the thumb floats over content
  transparentScrollbar: css`
    /* Firefox, Chrome 121+ — thumb / track */
    scrollbar-color: ${token.colorTextQuaternary} transparent;
    scrollbar-width: thin;

    /* Safari and older WebKit (ignored where scrollbar-color is supported) */
    &::-webkit-scrollbar,
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: ${token.colorTextQuaternary};
      border-radius: 3px;
    }
  `,
}));

/**
 * Alert that summarizes a list of items (e.g. selected resources in a modal)
 * as a standardized `ul` inside the alert description. The list scrolls
 * vertically once it exceeds `maxHeight`, so the surrounding modal never
 * grows unbounded. Item count indication belongs in the consumer-provided
 * `title` prop (i18n `count` interpolation).
 */
const BAIListAlert: React.FC<BAIListAlertProps> = ({
  items,
  // ~7 rows of list content; inherited from the pre-extraction
  // UpdateUsersModal style that this component standardizes.
  maxHeight = 165,
  ...alertProps
}) => {
  'use memo';
  const { token } = theme.useToken();
  const { styles } = useStyles();
  return (
    <BAIAlert
      {...alertProps}
      description={
        _.isEmpty(items) ? undefined : (
          <ul
            // make the scrollable region reachable by keyboard
            tabIndex={0}
            className={styles.transparentScrollbar}
            style={{
              margin: 0,
              padding: 0,
              paddingTop: token.paddingXXS,
              listStyle: 'circle',
              listStylePosition: 'inside',
              maxHeight,
              overflowY: 'auto',
            }}
          >
            {_.map(items, (item, index) => (
              <li key={item.key ?? `__index-${index}`}>{item.content}</li>
            ))}
          </ul>
        )
      }
    />
  );
};

export default BAIListAlert;

/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import AstryxRouterLink from './astryx-bui/AstryxRouterLink';
import { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

interface WebUIBreadcrumbProps extends BAIFlexProps {}
const WebUIBreadcrumb: React.FC<WebUIBreadcrumbProps> = (props) => {
  // const location = useLocation();
  const matches = useMatches();
  // matches[0].handle.

  const { token } = theme.useToken();

  const { t } = useTranslation();
  const breadcrumbMatches = _.filter(matches, (match) => {
    return (
      // @ts-ignore
      !_.isEmpty(match?.handle?.labelKey) ||
      // @ts-ignore
      !_.isEmpty(match?.handle?.title)
    );
  });
  return (
    <BAIFlex
      direction="column"
      justify="center"
      align="stretch"
      {...props}
      style={_.merge(
        {
          height: 40,
          paddingLeft: token.paddingContentHorizontalLG,
          borderBottom: `1px solid ${token.colorBorder}`,
        } as React.CSSProperties,
        props.style,
      )}
      data-testid="webui-breadcrumb"
    >
      {/* PILOT-DECISION: antd `Breadcrumb items + itemRender` → Astryx
          `Breadcrumbs` + `BreadcrumbItem` children (MAPPING §4). `itemRender`
          becomes `as={AstryxRouterLink}` on the navigable items; the last crumb is
          `isCurrent` and renders as plain text, which is what `itemRender`
          hand-rolled with a `<span>`. The trailing empty "dummy_tail" item
          existed only to force antd to draw one more `/` separator — dropped
          (Astryx draws separators between items only). Font sizing comes from
          `variant="supporting"` instead of an inline `fontSizeSM`. */}
      <Breadcrumbs variant="supporting">
        {_.map(breadcrumbMatches, (match, index) => {
          const isLast = index === breadcrumbMatches.length - 1;
          const href =
            // @ts-ignore
            match?.handle?.altPath || match.pathname;
          // @ts-ignore
          const title = match?.handle?.title || t(match?.handle?.labelKey);
          return isLast ? (
            <BreadcrumbItem key={match.id} isCurrent>
              {title}
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem key={match.id} href={href} as={AstryxRouterLink}>
              {title}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </BAIFlex>
  );
};

export default WebUIBreadcrumb;

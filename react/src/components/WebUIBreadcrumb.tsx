/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import WebUILink from './WebUILink';
import { breadcrumbExtraAtom } from './breadcrumbExtraAtom';
import { Breadcrumb, theme } from 'antd';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
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
  const extra = useAtomValue(breadcrumbExtraAtom);
  return (
    <BAIFlex
      direction="row"
      justify="between"
      align="center"
      gap="sm"
      {...props}
      style={_.merge(
        {
          height: 40,
          paddingLeft: token.paddingContentHorizontalLG,
          paddingRight: token.paddingContentHorizontalLG,
          borderBottom: `1px solid ${token.colorBorder}`,
        } as React.CSSProperties,
        props.style,
      )}
      data-testid="webui-breadcrumb"
    >
      <Breadcrumb
        style={{
          fontSize: token.fontSizeSM,
          // lineHeight: he,
        }}
        items={[
          ..._.map(
            _.filter(matches, (match) => {
              return (
                // @ts-ignore
                !_.isEmpty(match?.handle?.labelKey) ||
                // @ts-ignore
                !_.isEmpty(match?.handle?.title)
              );
            }),
            (match) => {
              return {
                key: match.id,
                href:
                  _.last(matches) === match
                    ? undefined
                    : // @ts-ignore
                      match?.handle?.altPath || match.pathname,
                //@ts-ignore
                title: match?.handle?.title || t(match?.handle?.labelKey),
              };
            },
          ),
          {
            // Add dummy tail to add a `/` at the end of the breadcrumb
            key: 'dummy_tail',
            title: ' ',
          },
        ]}
        itemRender={(currentRoute, _params, items) => {
          const isLast =
            currentRoute?.key === items[items.length - 2]?.key ||
            currentRoute?.key === 'dummy_tail';
          return isLast || !currentRoute.href ? (
            <span>{currentRoute.title}</span>
          ) : (
            <WebUILink
              to={currentRoute.href}
              style={{
                margin: 0,
                padding: 0,
                height: 'unset',
              }}
            >
              {currentRoute.title}
            </WebUILink>
          );
        }}
      />
      {extra ? (
        <BAIFlex
          align="center"
          justify="end"
          gap="xs"
          style={{ flexShrink: 0 }}
        >
          {extra}
        </BAIFlex>
      ) : null}
    </BAIFlex>
  );
};

export default WebUIBreadcrumb;

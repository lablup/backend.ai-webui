import { theme, Tooltip, Typography } from 'antd';
import type { TooltipProps } from 'antd/es/tooltip';
import type { EllipsisConfig } from 'antd/es/typography/Base';
import type { TextProps as AntdTextProps } from 'antd/es/typography/Text';
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface BAITextProps extends Omit<AntdTextProps, 'ellipsis'> {
  monospace?: boolean;
  // Enable CSS-based ellipsis with Safari compatibility (multi-line via -webkit-line-clamp)
  ellipsis?: boolean | EllipsisConfig;
}

// Derive Tooltip props from the ellipsis config.
function resolveTooltipProps(
  children: ReactNode,
  ellipsis: boolean | EllipsisConfig,
): TooltipProps | null {
  if (!ellipsis || typeof ellipsis !== 'object') return null;

  const { tooltip } = ellipsis;
  if (tooltip === true) return { title: children };
  if (
    tooltip &&
    typeof tooltip === 'object' &&
    !React.isValidElement(tooltip)
  ) {
    return { title: children, ...(tooltip as TooltipProps) };
  }
  return null;
}

const BAIText: React.FC<BAITextProps> = ({
  style,
  monospace,
  ellipsis,
  copyable,
  children,
  strong,
  italic,
  underline,
  delete: deleteProp,
  mark,
  code,
  keyboard,
  ...restProps
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const expandable = typeof ellipsis === 'object' ? ellipsis.expandable : false;
  const onExpand = typeof ellipsis === 'object' ? ellipsis.onExpand : undefined;

  useEffect(() => {
    if (!ellipsis || !textRef.current || isExpanded) return;
    const element = textRef.current;
    const rows = typeof ellipsis === 'object' ? ellipsis.rows || 1 : 1;
    const check = () => {
      if (!element) return;
      if (rows === 1) {
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      } else {
        setIsOverflowing(element.scrollHeight > element.clientHeight);
      }
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(element);
    return () => ro.disconnect();
  }, [ellipsis, children, isExpanded]);

  const handleExpand = (e: React.MouseEvent<HTMLElement>) => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpand?.(e, { expanded: newExpandedState });
  };

  if (!ellipsis) {
    return (
      <Typography.Text
        style={{ ...(monospace && { fontFamily: 'monospace' }), ...style }}
        copyable={copyable}
        strong={strong}
        italic={italic}
        underline={underline}
        delete={deleteProp}
        mark={mark}
        code={code}
        keyboard={keyboard}
        {...restProps}
      >
        {children}
      </Typography.Text>
    );
  }

  const rows = typeof ellipsis === 'object' ? ellipsis.rows || 1 : 1;
  const tooltipProps = resolveTooltipProps(children, ellipsis);

  // Styles for the container when code or keyboard is used
  const containerStyles: React.CSSProperties = {
    ...(code && {
      backgroundColor: token.colorFillTertiary,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadiusSM,
      padding: '0.2em 0.4em',
      fontFamily: token.fontFamilyCode,
      fontSize: '0.9em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: token.marginXXS,
    }),
    ...(keyboard && {
      backgroundColor: token.colorFillContent,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadiusSM,
      padding: '0.15em 0.4em',
      fontFamily: token.fontFamilyCode,
      fontSize: '0.9em',
      boxShadow: `0 2px 0 ${token.colorBorderSecondary}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: token.marginXXS,
    }),
  };

  // Styles for text content (excluding code/keyboard as they're on container)
  const textDecorationStyles: React.CSSProperties = {
    ...(monospace && { fontFamily: 'monospace' }),
    ...(strong && { fontWeight: token.fontWeightStrong }),
    ...(italic && { fontStyle: 'italic' }),
    ...(underline && deleteProp
      ? { textDecoration: 'underline line-through' }
      : underline
        ? { textDecoration: 'underline' }
        : deleteProp
          ? { textDecoration: 'line-through' }
          : {}),
    ...(mark && {
      backgroundColor: token.colorWarningBg,
      padding: '0 0.2em',
    }),
  };

  return (
    <Typography.Text
      {...restProps}
      copyable={(() => {
        if (!copyable) return undefined;
        if (typeof copyable === 'object') {
          return { ...copyable, text: copyable.text ?? String(children) };
        }
        return { text: String(children) }; // copyable === true
      })()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        ...containerStyles,
        ...style,
      }}
      ellipsis={false}
    >
      <Tooltip
        {...tooltipProps}
        open={tooltipProps && isOverflowing && !isExpanded ? undefined : false}
      >
        <span
          ref={textRef}
          style={{
            ...textDecorationStyles,
            overflow: isExpanded ? 'visible' : 'hidden',
            textOverflow: isExpanded ? 'clip' : 'ellipsis',
            flex: 1,
            minWidth: 0,
            ...(isExpanded
              ? {
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }
              : rows === 1
                ? {
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }
                : {
                    display: '-webkit-box',
                    WebkitLineClamp: rows,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                  }),
          }}
        >
          {children}
        </span>
      </Tooltip>
      {expandable && isOverflowing && (
        <Typography.Link
          onClick={handleExpand}
          style={{
            marginLeft: token.marginXXS,
            flexShrink: 0,
          }}
        >
          {isExpanded
            ? t('general.button.Collapse')
            : t('general.button.Expand')}
        </Typography.Link>
      )}
    </Typography.Text>
  );
};

export default BAIText;

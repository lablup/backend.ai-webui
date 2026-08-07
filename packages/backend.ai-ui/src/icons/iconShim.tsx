/**
 * iconShim — drop-in replacement for `@ant-design/icons`' custom-icon surface
 * (to-astryx ticket 07).
 *
 * `@ant-design/icons`' default export `Icon` is a real component (renders
 * `<span role="img" class="anticon">`, reads antd's IconContext, and pulls the
 * antd runtime — MAPPING.md P16). The 51 bespoke `BAI*Icon` files in this
 * directory use it only as an SVG frame:
 *
 *   <Icon component={SomeSvg} aria-label="..." {...props} />
 *
 * This shim reproduces exactly that frame with zero antd imports:
 *   - outer `<span role="img" class="anticon">` (class kept on purpose: the
 *     repo's own `react/src/fix_antd.css` baseline rules, unit-test and E2E
 *     selectors all key on `.anticon` until the Phase-4 selector migration)
 *   - svg receives `width/height: 1em`, `fill: currentColor`,
 *     `aria-hidden`, `focusable="false"` — same as antd's svgBaseProps
 *   - `spin` / `rotate` supported (antd IconBaseProps parity)
 *   - baseline styles + spin keyframes are injected once at runtime by this
 *     module itself, so the shim stays correct even after `fix_antd.css`
 *     shrinks (BUI has `sideEffects: false`, so a CSS-file import would be
 *     tree-shaken out of consumers — runtime injection is the P17-safe way
 *     to keep the styles travelling with the component).
 *
 * Type parity with `@ant-design/icons/lib/components/Icon` is deliberate:
 * `CustomIconComponentProps`, `IconBaseProps`, and `IconComponentProps`
 * mirror the antd declarations verbatim so `Omit<CustomIconComponentProps,
 * 'width' | 'height' | 'fill'>`-style consumer interfaces compile unchanged.
 */
import React, { forwardRef, useInsertionEffect } from 'react';

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill?: string;
  viewBox?: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export interface IconBaseProps extends React.HTMLProps<HTMLSpanElement> {
  spin?: boolean;
  rotate?: number;
}

export interface IconComponentProps extends IconBaseProps {
  viewBox?: string;
  component?:
    | React.ComponentType<
        CustomIconComponentProps | React.SVGProps<SVGSVGElement>
      >
    | React.ForwardRefExoticComponent<CustomIconComponentProps>;
  ariaLabel?: React.AriaAttributes['aria-label'];
}

/** Same contract as antd's svgBaseProps. */
const svgBaseProps = {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': true,
  focusable: 'false',
} as const;

const STYLE_ELEMENT_ID = 'bai-icon-shim-style';

/**
 * Baseline `.anticon` rules (copied from react/src/fix_antd.css, which in
 * turn mirrors @ant-design/icons' reset) + the spin animation. Injected once
 * per document on first Icon render.
 */
const SHIM_CSS = `
.anticon{display:inline-block;color:inherit;font-style:normal;line-height:0;text-align:center;text-transform:none;vertical-align:-0.125em;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.anticon>*{line-height:1}
.anticon svg{display:inline-block}
.anticon[tabindex]{cursor:pointer}
.anticon-spin{display:inline-block;animation:baiIconSpin 1s infinite linear}
@keyframes baiIconSpin{100%{transform:rotate(360deg)}}
`;

const ensureShimStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ELEMENT_ID;
  el.textContent = SHIM_CSS;
  document.head.appendChild(el);
};

const Icon = forwardRef<HTMLSpanElement, IconComponentProps>((props, ref) => {
  'use memo';
  const {
    className,
    component: Component,
    viewBox,
    spin,
    rotate,
    ariaLabel,
    children,
    style,
    ...restProps
  } = props;

  // useInsertionEffect: the CSS-in-JS injection slot — styles land before
  // layout effects and paint, and the injection stays out of the render phase.
  useInsertionEffect(() => {
    ensureShimStyles();
  }, []);

  const svgClassName = spin ? 'anticon-spin' : undefined;
  const svgStyle: React.CSSProperties | undefined = rotate
    ? { msTransform: `rotate(${rotate}deg)`, transform: `rotate(${rotate}deg)` }
    : undefined;

  // No annotation on purpose: inference keeps `width: '1em'` et al. as
  // literals, which satisfies CustomIconComponentProps' required width/height
  // in the `component` union type.
  const innerSvgProps = {
    ...svgBaseProps,
    className: svgClassName,
    style: svgStyle,
    viewBox,
  };

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      {...restProps}
      ref={ref}
      style={style}
      className={className ? `anticon ${className}` : 'anticon'}
    >
      {Component ? <Component {...innerSvgProps} /> : children}
    </span>
  );
});

Icon.displayName = 'BAIIconShim';

export default Icon;

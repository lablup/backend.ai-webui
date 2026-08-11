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
 *   - outer `<span role="img" class="bai-icon">`
 *   - svg receives `width/height: 1em`, `fill: currentColor`,
 *     `aria-hidden`, `focusable="false"` — same as antd's svgBaseProps
 *   - `spin` / `rotate` supported (antd IconBaseProps parity)
 *   - baseline styles + spin keyframes come from BUI's own stylesheet
 *     (`src/styles/backend.ai-ui.css`, imported by `src/index.ts` and exported
 *     as `backend.ai-ui/styles.css`). Ticket 07 injected them from here at
 *     runtime instead, because BUI declared `sideEffects: false` and a CSS
 *     import would have been tree-shaken away; ticket 30 fixed `sideEffects`
 *     to keep every CSS file, which makes the stylesheet the honest home. The
 *     injection also never fired for the components that spin a bare lucide
 *     glyph (`<LoaderCircle className="bai-icon-spin" />`) without rendering
 *     `Icon`.
 *
 * ## Why the class is `bai-icon`, not `anticon` (to-astryx final-B)
 *
 * Through ticket 30 the wrapper kept antd's own `anticon` / `anticon-spin`
 * class names, because the host's `fix_antd.css` baseline and a handful of
 * selectors still keyed on them. Nothing outside this repo's own first-party
 * CSS reads them any more — and keeping antd's name in a shipped CSS class
 * would have been misleading on its own terms: `anticon` is a
 * HIGH-confidence signature of `@ant-design/icons`, so our own output was
 * indistinguishable from a real antd reintroduction by inspection. Renaming
 * to a first-party name restores that signature's meaning: a literal
 * `anticon` class in the bundle again would mean someone actually pulled
 * `@ant-design/icons` back in — which, with antd removed from the
 * dependency graph entirely, `tsc` would already have refused to compile.
 *
 * Type parity with `@ant-design/icons/lib/components/Icon` is deliberate:
 * `CustomIconComponentProps`, `IconBaseProps`, and `IconComponentProps`
 * mirror the antd declarations verbatim so `Omit<CustomIconComponentProps,
 * 'width' | 'height' | 'fill'>`-style consumer interfaces compile unchanged.
 */
import React, { forwardRef } from 'react';

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

  const svgClassName = spin ? 'bai-icon-spin' : undefined;
  const svgStyle: React.CSSProperties | undefined = rotate
    ? { msTransform: `rotate(${rotate}deg)`, transform: `rotate(${rotate}deg)` }
    : undefined;

  // No annotation on purpose: inference keeps `width: '1em'` et al. as
  // literals, which satisfies CustomIconComponentProps' required width/height
  // in the `component` union type.
  //
  // `viewBox` is spread ONLY when the caller supplied one. antd's `IconBase`
  // does the same (`if (!viewBox) delete innerSvgProps.viewBox`) and the
  // reason is load-bearing here: every `BAI*Icon` renders an SVGR component
  // whose generated JSX is `<svg viewBox="0 0 24 24" … {...props}/>` — the
  // spread comes LAST, so passing `viewBox: undefined` did not "leave it
  // alone", it ERASED the file's own viewBox (React omits undefined
  // attributes). Without a viewBox an SVG has no user-unit→CSS-pixel mapping:
  // `width/height: 1em` sizes the box, but the paths keep drawing at raw user
  // units, so a 24-unit glyph rendered ~24px inside a 16px box and was
  // clipped. Most visible on the Model Store rail icon (24×24 source, the
  // largest viewBox of the bespoke set); every 51 `BAI*Icon` was affected.
  const innerSvgProps = {
    ...svgBaseProps,
    className: svgClassName,
    style: svgStyle,
    ...(viewBox ? { viewBox } : {}),
  };

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      {...restProps}
      ref={ref}
      style={style}
      className={className ? `bai-icon ${className}` : 'bai-icon'}
    >
      {Component ? <Component {...innerSvgProps} /> : children}
    </span>
  );
});

Icon.displayName = 'BAIIconShim';

export default Icon;

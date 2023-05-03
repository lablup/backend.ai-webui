import React, { CSSProperties, ReactNode } from "react";

export interface FlexPropsType {
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  justify?: "start" | "end" | "center" | "between" | "around";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  children?: ReactNode;
  disabled?: boolean;
}

export interface FlexProps
  extends FlexPropsType,
    React.HTMLAttributes<HTMLDivElement> {}

export default class Flex extends React.Component<FlexProps, any> {
  static Item: any;

  static defaultProps = {
    direction: "row",
    wrap: "nowrap",
    justify: "start",
    align: "center",
  };

  render() {
    const { style, direction, wrap, justify, align, children, ...restProps } =
      this.props;
    const transferConst = [justify, align];
    const transferConstStyle = transferConst.map((el) => {
      let tempTxt;
      switch (el) {
        case "start":
          tempTxt = "flex-start";
          break;
        case "end":
          tempTxt = "flex-end";
          break;
        case "between":
          tempTxt = "space-between";
          break;
        case "around":
          tempTxt = "space-around";
          break;
        default:
          tempTxt = el;
          break;
      }

      return tempTxt;
    });
    const flexStyle: CSSProperties = {
      display: "flex",
      flexDirection: direction,
      flexWrap: wrap,
      justifyContent: transferConstStyle[0],
      alignItems: transferConstStyle[1],
    };

    const inner = (
      <div
        style={{
          alignItems: "stretch",
          backgroundColor: "transparent",
          border: "0 solid black",
          boxSizing: "border-box",
          display: "flex",
          flexBasis: "auto",
          flexDirection: "column",
          flexShrink: 0,
          listStyle: "none",
          margin: 0,
          minHeight: 0,
          minWidth: 0,
          padding: 0,
          position: "relative",
          textDecoration: "none",
          zIndex: 0,
          ...flexStyle,
          ...style,
        }}
        {...restProps}
      >
        {children}
      </div>
    );

    return inner;
  }
}

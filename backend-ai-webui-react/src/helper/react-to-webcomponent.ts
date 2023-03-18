export default function (
  ReactComponent: React.FC<any> | React.ComponentClass<any>,
  React: any,
  ReactDOM: any
) {
  class ReactWebComponent extends HTMLElement {
    static get observedAttributes() {
      return ["value", "styles"];
    }

    constructor() {
      super();
      // Hierarchy:
      // this > shadowRoot > mountPoint(span) > reactRoot
      this.mountPoint = document.createElement("span");
      this.reactRoot = ReactDOM.createRoot(this.mountPoint);
      this.attachShadow({ mode: "open" });
      this.shadowRoot?.appendChild(this.mountPoint);
    }

    mountPoint: HTMLSpanElement;
    reactRoot: any;

    createReactElement(value: string, styles: string) {
      return React.createElement(
        ReactComponent,
        {
          value,
          styles,
          dispatchEvent: (name: string, detail: any, bubbles = true) => {
            this.dispatchEvent(
              new CustomEvent(name, {
                bubbles,
                detail: detail,
              })
            );
          },
          shadowRoot: this.shadowRoot,
        },
        React.createElement("slot")
      );
    }

    connectedCallback() {
      const title = this.getAttribute("value") || "";
      const styles = this.getAttribute("styles") || "";
      this.reactRoot.render(this.createReactElement(title, styles));
    }

    disconnectedCallback() {
      this.reactRoot.unmount();
    }

    attributeChangedCallback(name: any, oldValue: any, newValue: any) {
      //re-render react component when attribute changes
      if (name === "value") {
        this.reactRoot.render(
          this.createReactElement(newValue, this.getAttribute("styles") || "")
        );
      } else if (name == "styles") {
        this.reactRoot.render(
          this.createReactElement(this.getAttribute("value") || "", newValue)
        );
      }
    }
  }
  return ReactWebComponent;
}

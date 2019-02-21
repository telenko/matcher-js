import { RUNNER } from "./Matcher/Runner";
import { ExtensionContainer } from "./ExtensionContainer/ExtensionContainer";

export function defineMatcher(queryString, Clazz) {
  return RUNNER.defineMatcher(queryString, Clazz);
};

export function patchShadowDOM() {
  const origAttachShadow = HTMLElement.prototype.attachShadow;
  HTMLElement.prototype.attachShadow = function(...args) {
    const response = origAttachShadow.call(this, ...args);
    //TODO async??
    RUNNER.add(this.shadowRoot);
    return response;
  };
}

window.__defineMatcher = defineMatcher;

customElements.define("extension-container", ExtensionContainer);

let readyHandler = () => {
    RUNNER.run();
};
if (document.readyState === "complete") {
    setTimeout(() => readyHandler());
} else {
    document.addEventListener("DOMContentLoaded", readyHandler);
}

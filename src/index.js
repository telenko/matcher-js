import { RUNNER } from "./Matcher/Runner";
import { ExtensionContainer } from "./ExtensionContainer/ExtensionContainer";
import { NodeController } from "./Matcher/NodeController";

export function defineMatcher(queryString, Clazz) {
  return RUNNER.defineMatcher(queryString, Clazz);
};

export function patchShadowDOM() {
  const origAttachShadow = HTMLElement.prototype.attachShadow;
  HTMLElement.prototype.attachShadow = function(...args) {
    const response = origAttachShadow.call(this, ...args);
    setTimeout(() => RUNNER.apply(this.shadowRoot), 100);
    return response;
  };
}

export function getMatchers(node) {
  return NodeController.getInstances(node);
}

customElements.define("extension-container", ExtensionContainer);

let readyHandler = () => {
    RUNNER.run();
};
if (document.readyState === "complete") {
    setTimeout(() => readyHandler());
} else {
    document.addEventListener("DOMContentLoaded", readyHandler);
}
import { RUNNER } from "./Matcher/Runner";
import { ExtensionContainer } from "./ExtensionContainer/ExtensionContainer";
import { NodeController } from "./Matcher/NodeController";

export function defineMatcher(queryString, Clazz) {
  return RUNNER.defineMatcher(queryString, Clazz);
};

export function patchShadowDOM() {
  if (window.__matcher_shadow_plugin) {
    return;
  }
  const origAttachShadow = HTMLElement.prototype.attachShadow;
  HTMLElement.prototype.attachShadow = function(...args) {
    const response = origAttachShadow.call(this, ...args);
    setTimeout(() => RUNNER.apply(response));
    return response;
  };
  window.__matcher_shadow_plugin = true;
}

export function getMatchers(node) {
  return NodeController.getInstances(node);
}

if(!customElements.get('matchers-container')) {
  customElements.define("matchers-container", ExtensionContainer);
}

let readyHandler = () => {
    RUNNER.run();
};
if (document.readyState === "complete") {
    setTimeout(() => readyHandler());
} else {
    document.addEventListener("DOMContentLoaded", readyHandler);
}
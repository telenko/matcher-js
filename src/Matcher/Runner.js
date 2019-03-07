
import { NodeWatcher } from "../NodeWatcher/NodeWatcher";
import { NodeController } from "./NodeController";
import { MatcherQuery } from "./MatcherQuery";

const CONTROLLER = Symbol();
const WATCHER = Symbol();
const MATCHER = Symbol();
const EXT_MAP = Symbol();
const CONTROLS = Symbol();

class Runner {

  constructor() {
    this[EXT_MAP] = {};
    this[CONTROLS] = new Set();
    this[WATCHER] = new NodeWatcher({
      onNodeAdded: node => {
        node[CONTROLLER] = new NodeController(node);
        this[CONTROLS].add(node[CONTROLLER]);
      },
      onNodeRemoved: node => {
        if (!node[CONTROLLER]) {
          return;
        }
        this[CONTROLS].delete(node[CONTROLLER]);
        node[CONTROLLER].destroy();
        delete node[CONTROLLER];
      },
      onAttributeChanged: (node, attr, value, oldValue) => {
        if (!node[CONTROLLER]) {
          return;
        }
        node[CONTROLLER].onAttributeChanged(attr, value, oldValue);
      }
    });
  }

  run() {
    this.apply(document.body);
  }

  apply(node) {
    this[WATCHER].add(node);
  }

  defineMatcher(query, Clazz) {
    const matcher = new MatcherQuery(query);
    Clazz[MATCHER] = matcher;
    if (!this[EXT_MAP][matcher.attribute]) {
      this[EXT_MAP][matcher.attribute] = [];
    }
    this[EXT_MAP][matcher.attribute].push(Clazz);
    this[CONTROLS].forEach(control => {
      control.onMatcherDefined(Clazz);
    });
  }

  getExtensionsByAttibute(attribute) {
    return this[EXT_MAP][attribute] || [];
  }

  getMatcher(extClazz) {
    return extClazz[MATCHER];
  }

}

let runner;
if (window.__extensionRunner) {
  runner = window.__extensionRunner;
} else {
  runner = new Runner();
}

export const RUNNER = runner;

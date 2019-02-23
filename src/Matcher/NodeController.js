import { RUNNER } from "./Runner";
const NODE = Symbol();
const EXTENSIONS = Symbol();
const INSTANCES = Symbol();
const INST_PUBLIC = Symbol();

export class NodeController {

  constructor(node) {
    this[EXTENSIONS] = new Set();
    this[INSTANCES] = new Set();
    const self = this;
    Object.defineProperty(node, INST_PUBLIC, {
      get() {
        return self[INSTANCES];
      }
    });
    this[NODE] = node;
    if (node.attributes && node.attributes.length) {
      [...node.attributes].forEach(({ name }) => {
        applyAttribute.call(this, name);
      });
    }
  }

  onAttributeChanged(attr, newVal, oldValue) {
    applyAttribute.call(this, attr);
    const observedAttributes = getObservedAttributes.call(this);
    if (!observedAttributes.includes(attr)) {
      return;
    }
    this[INSTANCES].forEach(instance => {
      if (instance.constructor.observedAttributes &&
          instance.constructor.observedAttributes.length &&
          instance.constructor.observedAttributes.includes(attr) &&
          instance.attributeChangedCallback) {
            instance.attributeChangedCallback(attr, oldValue, newVal);//TODO why 2nd time?
      }
    });
  }

  onMatcherDefined(Clazz) {
    applyMatcher.call(this, Clazz);
  }

  destroy() {
    this[INSTANCES].forEach(disconnectInstance);
    this[INSTANCES].clear();
    this[EXTENSIONS].clear();
    delete this[INSTANCES];
    delete this[EXTENSIONS];
    delete this[NODE];
  }

  static getInstances(node) {
    return node[INST_PUBLIC];
  }

}

function applyMatcher(Clazz) {
  const matcher = RUNNER.getMatcher(Clazz);
  if (!matcher) {
    return;
  }
  const { attribute } = matcher;
  const hasAttribute = this[NODE].hasAttribute(attribute);
  const matchMap = {};
  if (hasAttribute) {
    matchMap[attribute] = this[NODE].getAttribute(attribute);
  }
  if (matcher.isMatches(matchMap)) {
    applyExtension.call(this, Clazz);
  } else {
    removeExtension.call(this, Clazz);
  }
}

function applyAttribute(attribute) {
  RUNNER.getExtensionsByAttibute(attribute).forEach(Clazz => {
    applyMatcher.call(this, Clazz);
  });
}

function applyExtension(extClazz) {
  this[EXTENSIONS].add(extClazz);
  this[EXTENSIONS].forEach(ExtClazz => {
    const hasInst = [...this[INSTANCES]].some(inst => inst.constructor === ExtClazz);
    if (!hasInst) {
      const inst = new ExtClazz();
      this[INSTANCES].add(inst);
      if (inst.connectedCallback) {
        inst.connectedCallback();
      }
      inst.element = this[NODE];
    }
  });
}

function getObservedAttributes() {
  const resp = new Set();
  this[EXTENSIONS].forEach(ExtClazz => {
    if (ExtClazz.observedAttributes && ExtClazz.observedAttributes.length) {
      ExtClazz.observedAttributes.forEach(attribute => {
        resp.add(attribute);
      });
    }
  });
  return [...resp];
}

function removeExtension(ExtClazz) {
  this[EXTENSIONS].delete(ExtClazz);
  [...this[INSTANCES]].some(inst => {
    const suitsExtension = inst.constructor === ExtClazz;
    if (suitsExtension) {
      disconnectInstance(inst);
      this[INSTANCES].delete(inst);
    }
    return suitsExtension;
  });
}

function disconnectInstance(inst) {
  if (inst.disconnectedCallback) {
    inst.disconnectedCallback();
  }
}
import { RUNNER } from "./Runner";
const NODE = Symbol();
const EXTENSIONS = Symbol();
const INSTANCES = Symbol();
const OBSERVED_ATTR_MAP = Symbol();

export class NodeController {

  constructor(node) {
    this[EXTENSIONS] = new Set();
    this[INSTANCES] = new Set();
    this[OBSERVED_ATTR_MAP] = {};
    this[NODE] = node;
    if (node.attributes && node.attributes.length) {
      [...node.attributes].forEach(applyAttribute.bind(this));
    }
  }

  onAttributeChanged(attr) {
    applyAttribute.call(this, attr);
    const observedAttributes = getObservedAttributes.call(this);
    if (!observedAttributes.includes(attr)) {
      return;
    }
    const prevVal = this[OBSERVED_ATTR_MAP][attr];
    const newVal = this[NODE].getAttribute(attr);
    this[OBSERVED_ATTR_MAP][attr] = newVal;
    this[INSTANCES].forEach(instance => {
      if (instance.constructor.observedAttributes &&
          instance.constructor.observedAttributes.length &&
          instance.constructor.observedAttributes.includes(attr) &&
          instance.attributeChangedCallback) {
            instance.attributeChangedCallback(attr, prevVal, newVal);//TODO why 2nd time?
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
  getObservedAttributes.call(this).forEach(attribute => {
    if (!this[OBSERVED_ATTR_MAP][attribute]) {
      this[OBSERVED_ATTR_MAP][attribute] = this[NODE].getAttribute(attribute);
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

const ADDED_CALLBACK = Symbol();
const REMOVED_CALLBACK = Symbol();
const ATTR_CHANGE_CALLBACK = Symbol();
const OBSERVER = Symbol();
const CONNECTED = Symbol();
const ATTRS_MAP = Symbol();

export class NodeWatcher {

  constructor({ onNodeAdded, onNodeRemoved, onAttributeChanged }) {
    this[ADDED_CALLBACK] = onNodeAdded;
    this[REMOVED_CALLBACK] = onNodeRemoved;
    this[ATTR_CHANGE_CALLBACK] = onAttributeChanged;
    this[OBSERVER] = new MutationObserver(mutates => {
      for (let { type, addedNodes, removedNodes, attributeName, target: node } of mutates) {
          if (type === "attributes") {
              if (!node[CONNECTED]) {
                  return;
              }
              detectAttributesChange.call(this, node);
              return;
          }
          if (type !== "childList") {
              return;
          }
          if (addedNodes && addedNodes.length) {
            addedNodes.forEach(readNode.bind(this));
          }
          if (removedNodes && removedNodes.length) {
            removedNodes.forEach(unreadNode.bind(this));
          }
      }
    });
  }

  add(node) {
    processNodeRecursive.call(this, node, processedNode => {
      readNode.call(this, processedNode);
    });
    this[OBSERVER].observe(node, { childList: true, subtree: true, attributes: true });//TODO attrs filter!!! TODO unsubscribe!!!
  }

}

function readNode(node) {
  if (isTextNode(node)) {
    return;
  }
  if (node[CONNECTED]) {
    return;
  }
  node[CONNECTED] = true;
  const attrsList = getAttributes(node);
  node[ATTRS_MAP] = attrsList.reduce((acc, { name, value }) => {
    acc[name] = { value, oldValue: undefined, active: true };
    return acc;
  }, {});
  this[ADDED_CALLBACK](node);
}

function unreadNode(node) {
  if (!node[CONNECTED]) {
    return;
  }
  node[CONNECTED] = false;
  this[REMOVED_CALLBACK](node);
}

function getAttributes(node) {
  return node.attributes ? [...node.attributes] : [];
}

function detectAttributesChange(node) {
  const currentAttrs = getAttributes(node);
  currentAttrs.forEach(({name, value}) => {
    const oldAttr = node[ATTRS_MAP][name] || {};
    node[ATTRS_MAP][name] = {
      value,
      oldValue: oldAttr.value,
      active: true
    };
  });
  Object.keys(node[ATTRS_MAP]).filter(attr => {
    return !currentAttrs.map(curAttr => curAttr.name).includes(attr);
  }).forEach(attr => {
    const deletedAttr = node[ATTRS_MAP][attr] || {};
    node[ATTRS_MAP][attr] = {
      value: undefined,
      oldValue: deletedAttr.value,
      active: false
    };
  });

  Object.keys(node[ATTRS_MAP]).filter(attr => {
    const { value, oldValue } = node[ATTRS_MAP][attr];
    return value !== oldValue;
  }).forEach(modifiedAttr => {
    const { value, oldValue } = node[ATTRS_MAP][modifiedAttr];
    this[ATTR_CHANGE_CALLBACK](node, modifiedAttr, value, oldValue);
  });

  //cleanup for not active attrs
  Object.keys(node[ATTRS_MAP]).filter(attr => {
    return !node[ATTRS_MAP][attr].active;
  }).forEach(deletedAttr => {
    delete node[ATTRS_MAP][deletedAttr];
  });
}

function processNodeRecursive(node, callback) {
    if (isTextNode(node)) {
      return;
    }
    callback(node);
    if (node.childNodes) {
        node.childNodes.forEach(childNode => {
            processNodeRecursive(childNode, callback);
        });
    }
}

function isTextNode(node) {
    if (!(node instanceof Node)) {
        return false;
    }
    return node.nodeType === Node.TEXT_NODE;
}

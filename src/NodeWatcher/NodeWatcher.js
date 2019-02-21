const ADDED_CALLBACK = Symbol();
const REMOVED_CALLBACK = Symbol();
const ATTR_CHANGE_CALLBACK = Symbol();
const OBSERVER = Symbol();
const CONNECTED = Symbol();
const CUR_ATTR_LIST = Symbol();

export class NodeWatcher {

  constructor({ onNodeAdded, onNodeRemoved, onAttributeChanged }) {
    this[ADDED_CALLBACK] = onNodeAdded;
    this[REMOVED_CALLBACK] = onNodeRemoved;
    this[ATTR_CHANGE_CALLBACK] = onAttributeChanged;
    this[OBSERVER] = new MutationObserver(mutates => {
      for (let { type, addedNodes, removedNodes, attributeName, target } of mutates) {
          if (type === "attributes") {
              if (!target[CONNECTED]) {
                  return;
              }
              const node = target;
              const curAttributes = [...node.attributes];
              node[CUR_ATTR_LIST].filter(oldAttr => {
                if (oldAttr === attributeName) {
                  return false;
                }
                return !curAttributes.includes(oldAttr);
              }).forEach(removedAttribute => {
                onAttributeChanged(target, removedAttribute);
              });
              node[CUR_ATTR_LIST] = curAttributes;
              onAttributeChanged(target, attributeName);
              return;
          }
          if (type !== "childList") {
              return;
          }
          if (addedNodes && addedNodes.length) {
            addedNodes.forEach(readNode);
          }
          if (removedNodes && removedNodes.length) {
            removedNodes.forEach(unreadNode);
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
  if (node[CONNECTED]) {
    return;
  }
  node[CONNECTED] = true;
  node[CUR_ATTR_LIST] = [...node.attributes];
  this[ADDED_CALLBACK](node);
}

function unreadNode(node) {
  if (!node[CONNECTED]) {
    return;
  }
  node[CONNECTED] = false;
  this[REMOVED_CALLBACK](node);
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

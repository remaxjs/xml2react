import { Node, Element, DataNode } from 'domhandler';

export function isElement(node: Node | undefined): node is Element {
  if (!node) {
    return false;
  }
  return node.type === 'tag';
}

export function isDataNode(node: Node | undefined): node is DataNode {
  if (!node) {
    return false;
  }
  return node.type === 'text';
}

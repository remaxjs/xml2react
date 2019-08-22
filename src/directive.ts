import { buildExpression } from './expression';
import { Element } from 'domhandler';

export function buildIfDirective(node: Element) {
  const expression = buildExpression(node.attribs['a:if']);
  return [`((${expression}) ? (\n`, `) : null)\n`];
}

export function buildElseDirective(node: Element) {
  return [];
}

export function buildElseIfDirective(node: Element) {
  return [];
}

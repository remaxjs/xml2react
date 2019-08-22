import { buildExpression } from './expression';
import { Element } from 'domhandler';
import { isElement } from './types';

export const directiveBuilders: { [name: string]: Function } = {
  'a:if': buildIfDirective,
  'a:elsif': buildElseIfDirective,
  'a:else': buildElseDirective,
};

export function buildIfDirective(node: Element) {
  const expression = buildExpression(node.attribs['a:if']);
  const start = `((${expression}) ? (\n`;
  let end = `) : null)\n`;
  if (node.next && isElement(node.next) && node.attribs['a:else']) {
    end = buildElseDirective(node.next);
  }
  return [start, end];
}

export function buildElseDirective(node: Element) {
  return [];
}

export function buildElseIfDirective(node: Element) {
  return [];
}

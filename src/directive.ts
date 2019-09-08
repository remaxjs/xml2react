import { buildExpression } from './expression';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { isElement } from './types';

export const directiveBuilders: { [name: string]: Function } = {
  'a:if': buildIfDirective,
  'a:elsif': buildElseIfDirective,
  'a:else': buildElseDirective,
};

export function buildIfDirective(path: NodePath<t.JSXAttribute>, value: string) {
  const parentPath = path.parentPath.parentPath as NodePath<t.JSXElement>;

  const nextElement = path.getSibling(+path.key + 1);
  const test = buildExpression((path.node.value as t.StringLiteral).value);

  parentPath.replaceWith(
    t.jsxExpressionContainer(
      t.conditionalExpression(test, parentPath.node, t.isJSXElement(nextElement) ? nextElement : t.nullLiteral()),
    ),
  );

  path.remove();
}

export function buildElseDirective(node: Element) {
  return [];
}

export function buildElseIfDirective(node: Element) {
  return [];
}

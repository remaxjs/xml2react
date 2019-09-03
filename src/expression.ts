import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';

const ExpressionPattern = /{{(.+)}}/;

export function isExpression(text: string) {
  return ExpressionPattern.test(text);
}

export function extractCode(text: string) {
  const matches = text.match(ExpressionPattern);
  return matches ? matches[1] : '';
}

export function buildExpression(text: string) {
  const code = extractCode(text);
  const ast = parse(code);
  traverse(ast, {
    ExpressionStatement(path: NodePath<t.ExpressionStatement>) {
      // {{foo}}
      if (t.isIdentifier(path.node.expression)) {
        path.node.expression = t.memberExpression(t.identifier('props'), path.node.expression);
      }
    },
  });

  return (ast.program.body[0] as t.ExpressionStatement).expression;
}

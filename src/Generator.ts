import prettier from 'prettier';
import MagicString from 'magic-string';
import { Node } from 'domhandler';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { buildIfDirective } from './directive';
import { isElement, isDataNode } from './types';

export interface Options {
  pretty?: boolean;
}

export default class Generator {
  dom: Node[];
  code = new MagicString('');
  hostTags: string[] = [];
  options: Options;

  constructor(dom: Node[], options: Options = {}) {
    this.dom = dom;
    this.options = options;
  }

  generate() {
    this.normalizeExpression(this.dom);
    const jsx: string[] = [];
    this.generateJSX(this.dom, jsx);
    jsx.unshift('<>');
    jsx.push('</>');
    let code = this.generateComponent(jsx.join(''));
    if (this.options.pretty) {
      code = prettier.format(code, { singleQuote: true, parser: 'babel' });
    }
    return code;
  }

  normalizeExpression(tree: Node[]) {
    tree.forEach(node => {
      if (isElement(node)) {
        this.normalizeExpression(node.children);
      }
      if (isDataNode(node)) {
        node.data = node.data.replace(/{{(.+?)}}/g, (match, p1) => {
          return `{${p1}}`;
        });
      }
    });
  }

  generateJSX(tree: Node[], lines: string[]) {
    tree.forEach(node => {
      if (isElement(node)) {
        const { name, attribs, children } = node;
        const attributesString = Object.keys(attribs)
          .map(name => `${name}="${attribs[name]}"`)
          .join(' ');
        lines.push(`<${(name + ' ' + attributesString).trim()}>`);
        this.generateJSX(children, lines);
        lines.push(`</${name}>`);
      } else if (isDataNode(node)) {
        lines.push(node.data);
      }
    });
  }

  generateComponent(jsx: string) {
    const ast = parse(jsx, {
      plugins: ['jsx'],
    });
    traverse(ast, {
      JSXAttribute(path) {
        const node = path.node;

        if (!node.name) {
          return;
        }

        if (node.name.name === 'class') {
          path.replaceWith(t.jsxAttribute(t.jsxIdentifier('className'), node.value));
        } else if (t.isJSXNamespacedName(node.name)) {
          if (node.name.namespace.name === 'a' && node.name.name.name === 'if') {
            buildIfDirective(path, (node.value as t.StringLiteral).value);
          }
        }
      },
    });

    const code = generate(ast, {
      quotes: 'single',
    }).code.replace(/;$/, '');
    return `
    export default props => (${code});
    `;
  }
}

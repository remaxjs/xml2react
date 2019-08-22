import prettier from 'prettier';
import MagicString from 'magic-string';
import { Node, Element, DataNode } from 'domhandler';
import { directiveBuilders } from './directive';
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
    this.code.append('export default (props) => (\n');
    this.walk(this.dom);
    this.code.append(');');
    let code = this.code.toString();
    if (this.options.pretty) {
      code = prettier.format(code, { singleQuote: true, parser: 'babel' });
    }
    return code;
  }

  walk(tree: Node[]) {
    tree.forEach(node => {
      if (isElement(node)) {
        const { name, attribs } = node;
        const directives: Array<string[]> = [];
        Object.keys(attribs).forEach(attrName => {
          const build = directiveBuilders[attrName];
          if (build) {
            const directive = build(node);
            directives.push(directive);
            if (directive[0]) {
              this.code.append(directive[0]);
            }
          }
        });

        if (name === 'import-module') {
          this.code.prepend(`import ${attribs.name} from ${attribs.from};\n`);
        } else {
          const attributesString = Object.keys(attribs)
            .filter(name => !directiveBuilders[name])
            .map(name => `${name}=${attribs[name]}`)
            .join(' ');
          this.code.append(`<${(name + ' ' + attributesString).trim()}>`);
          this.walk(node.children);
          this.code.append(`</${name}>\n`);

          while (directives.length > 0) {
            const directive = directives.pop()!;
            if (directive[1]) {
              this.code.append(directive[1]);
            }
          }
        }
      } else if (isDataNode(node)) {
        this.code.append(node.data);
      }
    });
  }
}

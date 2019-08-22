import { Parser } from 'htmlparser2';
import { DomHandler, Node } from 'domhandler';

export default function parse(html: string): Promise<Node[]> {
  return new Promise((resolve, reject) => {
    const handler = new DomHandler(function(error, dom) {
      if (error) {
        reject(error);
      } else {
        resolve(dom);
      }
    });
    const parser = new Parser(handler);
    parser.write(html);
    parser.end();
  });
}

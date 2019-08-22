import parse from './parse';
import Generator, { Options } from './Generator';

export async function transform(html: string, options: Options) {
  const dom = await parse(html);
  const code = new Generator(dom, options).generate();
  return code;
}

import parse from './parse';
import Generator, { Options } from './Generator';

export async function transform(html: string, options: Options) {
  const dom = await parse(
    html
      .split('\n')
      .map(l => l.trim())
      .filter(l => !!l)
      .join(''),
  );
  const code = new Generator(dom, options).generate();
  return code;
}

import { callScript } from './call-script';

describe('callScript()', () => {
  it.each([
    './samples/c/hello_world.c',
    './samples/cpp/function_rec.cpp',
    './samples/cpp/hello_world.cpp',
    './samples/python/hello_world.py',
    // './samples/php/hello_world.php',
  ])('should match snapshot for %s', async fileRelativePath => {
    const stringified = await callScript(fileRelativePath, 'off');
    expect(JSON.parse(stringified)).toMatchSnapshot();
  });
});

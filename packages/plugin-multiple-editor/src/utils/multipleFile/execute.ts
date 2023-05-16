export function execute(str: string) {
  const fn = new Function(`${str};return exports;`);
  return fn();
}

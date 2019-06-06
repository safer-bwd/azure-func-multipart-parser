export default str => str.split(';')
  .map(item => item.split('=').map(i => i.trim().replace(/^"(.*)"$/, '$1')))
  .filter(item => item.length > 1)
  .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

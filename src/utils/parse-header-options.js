export default str => str.split(';')
  .map(item => item.split('=').map(i => i.trim()))
  .filter(item => item.length > 1)
  .reduce((acc, [key, val]) => ({ ...acc, [key]: val.replace(/^"(.*)"$/, '$1') }), {});

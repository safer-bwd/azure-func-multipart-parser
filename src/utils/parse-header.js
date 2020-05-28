const removeQuotes = str => str.replace(/^"(.*)"$/, '$1');

export default str => str.split(';')
  .map(item => item.split('=').map(s => s.trim()))
  .reduce((acc, [key, val]) => ({ ...acc, [key]: val ? removeQuotes(val) : true }), {});

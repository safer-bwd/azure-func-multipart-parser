export default str => str.split(';')
  .map(item => item.split('=').map(i => i.trim().replace(/^"(.*)"$/, '$1')))
  .filter(item => item.length > 1)
  .reduce((aсс, [key, val]) => ({ ...aсс, [key]: val }), {});

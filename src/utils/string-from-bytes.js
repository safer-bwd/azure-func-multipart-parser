export default bytes => bytes
  .map(byte => String.fromCharCode(byte))
  .join('')
  .trim();

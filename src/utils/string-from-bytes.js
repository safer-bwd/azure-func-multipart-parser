export default (bytes, encoding) => Buffer.from(bytes)
  .toString(encoding);

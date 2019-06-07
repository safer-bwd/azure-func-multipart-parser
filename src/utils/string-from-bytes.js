export default (bytes, encode) => Buffer.from(bytes)
  .toString(encode).trim();

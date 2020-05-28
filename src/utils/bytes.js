const LF = 0x0A;
const CR = 0x0D;

export const isLF = byte => byte === LF;

export const endsWithCRLF = (bytes) => {
  const { length } = bytes;
  return bytes[length - 2] === CR && bytes[length - 1] === LF;
};

export const isEmptyString = (bytes) => {
  const { length } = bytes;
  return (length === 2 && endsWithCRLF(bytes)) || (length === 1 && bytes[0] === LF);
};

export const bytesToString = (bytes, encoding) => Buffer.from(bytes).toString(encoding);

const stringToBytes = (string, encoding) => Array.from(Buffer.from(string, encoding));

export const hasString = (bytes, str) => {
  const strLength = stringToBytes(str).length;
  if (bytes.length > (strLength + 2)) {
    return false;
  }

  return bytesToString(bytes).trim() === str;
};

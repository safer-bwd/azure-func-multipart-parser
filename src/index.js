import get from './utils/get-ignore-case';
import parseНeader from './utils/parse-header';
import {
  bytesToString,
  endsWithCRLF,
  hasString,
  isEmptyString,
  isLF,
} from './utils/bytes';

/**
 * Checks if it is a request with multipart form
 * @memberof parser
 * @param {Object} headers The object of headers (`request.headers`)
 * @return {boolean}
 */
const isMultipartForm = (headers) => {
  const contentType = get(headers, 'Content-Type', '');
  const mimeType = contentType.split(';')[0].trim().toLowerCase();

  return [
    'multipart/form-data',
    'multipart/mixed'
  ].includes(mimeType);
};

/**
 * Get a boundary from request headers
 * @memberof parser
 * @param {Object} headers The object of headers (`request.headers`)
 * @return {string}
 */
const getBoundary = (headers) => {
  const contentType = get(headers, 'Content-Type', '');
  const { boundary = '' } = parseНeader(contentType);
  return boundary;
};

const parsePartHeader = (partHeader) => {
  const str = bytesToString(partHeader).trim();
  const headers = str.split('\n')
    .map(s => s.split(':').map(t => t.trim()))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  return headers;
};

const createFormPart = (partHeader, partData) => {
  const headers = parsePartHeader(partHeader);
  const contentDisposition = get(headers, 'Content-Disposition');
  const { name, filename } = parseНeader(contentDisposition);

  if (!filename) {
    const value = bytesToString(partData);
    return { name, value };
  }

  const contentType = get(headers, 'Content-Type') || '';
  const type = contentType.split(';')[0] || 'application/octet-stream';
  const { charset } = parseНeader(contentType);
  const contentEncoding = get(headers, 'Content-Transfer-Encoding') || '';
  const encoding = contentEncoding.split(';')[0];
  const content = Buffer.from(partData);

  /**
   * @typedef {Object} fileObject
   * @memberof resultOfParsing
   * @property {string} filename The file name
   * @property {string} type The content type
   * @property {string} charset The charset
   * @property {string} encoding The transfer encoding
   * @property {Buffer} content The file content
   */
  return {
    name,
    filename,
    type,
    charset,
    encoding,
    content
  };
};

const getFormParts = (body, boundary) => {
  const separatorStr = `--${boundary}`;
  const endStr = `--${boundary}--`;
  const isFormSeparator = bytes => hasString(bytes, separatorStr);
  const isEndOfForm = bytes => hasString(bytes, endStr);
  const isEndOfHeader = isEmptyString;

  const parts = [];
  let state = 'preamble';
  let bytes = [];
  let partHeader = [];
  let partData = [];

  const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
  Array.from(bodyBuffer).forEach((byte) => {
    if (state === 'epilogue') {
      return;
    }

    bytes.push(byte);

    if (!isLF(byte)) {
      return;
    }

    switch (state) {
      case 'preamble':
        if (isFormSeparator(bytes)) {
          state = 'partHeader';
        }
        break;
      case 'partHeader':
        if (isEndOfHeader(bytes)) {
          state = 'partData';
          partHeader = partHeader.slice(0, endsWithCRLF(bytes) ? -2 : -1);
        } else {
          partHeader = partHeader.concat(bytes);
        }
        break;
      case 'partData':
        if (isFormSeparator(bytes) || isEndOfForm(bytes)) {
          state = isEndOfForm(bytes) ? 'epilogue' : 'partHeader';
          partData = partData.slice(0, endsWithCRLF(bytes) ? -2 : -1);
          const part = createFormPart(partHeader, partData);
          parts.push(part);
          partHeader = [];
          partData = [];
        } else {
          partData = partData.concat(bytes);
        }
        break;
      default:
        throw new Error(`Unexpected state '${state}'`);
    }

    bytes = [];
  });

  return parts;
};

/**
 * Parse a body with multipart form
 * @memberof parser
 * @param {string|Buffer} body The request body (`request.body`)
 * @param {string} boundary The multipart form boundary
 * @return {resultOfParsing}
 */
const parseBody = (body, boundary) => {
  const parts = getFormParts(body, boundary);

  const files = parts
    .filter(p => p.filename)
    .reduce((acc, p) => ({ ...acc, [p.name]: p }), {});

  const fields = parts
    .filter(p => !p.filename)
    .reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {});

  /**
   * @typedef {Object} resultOfParsing
   * @property {Object.<sting, sting>} fields
   * @property {Object.<sting, fileObject>} files
   */
  return { files, fields };
};

/**
 * Parse a multipart form
 * @memberof parser
 * @param {Object} request The request object
 * @return {resultOfParsing}
 */
const parse = (request) => {
  const { headers, body } = request;
  if (!isMultipartForm(headers)) {
    throw Error('Invalid content type!');
  }

  const boundary = getBoundary(headers);
  const result = parseBody(body, boundary);

  return result;
};

/**
 * @module {Object} parser
 */
export default {
  parse,

  getBoundary,
  isMultipartForm,
  parseBody
};

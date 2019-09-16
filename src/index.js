import get from './utils/get-ignore-case';
import parseHeaderOpts from './utils/parse-header-options';
import isLineFeed from './utils/is-line-feed';
import stringFromBytes from './utils/string-from-bytes';

/**
 * Get a boundary from request headers
 * @memberof parser
 * @param {Object} headers The object of headers (`request.headers`)
 * @return {string}
 */
const getBoundary = (headers) => {
  const header = get(headers, 'Content-Type');
  const opts = parseHeaderOpts(header);
  return get(opts, 'boundary');
};

const createFormPart = (headers, data) => {
  const contentDisposition = get(headers, 'Content-Disposition');
  const { name, filename } = parseHeaderOpts(contentDisposition);

  if (filename === undefined) {
    const value = stringFromBytes(data);
    return { name, value };
  }

  const contentType = get(headers, 'Content-Type') || '';
  const type = contentType.split(';')[0] || 'application/octet-stream';
  const { charset } = parseHeaderOpts(contentType);
  const contentEncoding = get(headers, 'Content-Transfer-Encoding') || '';
  const encoding = contentEncoding.split(';')[0];
  const content = Buffer.from(data);

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
  const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);

  const isFormSep = line => line === `--${boundary}`;
  const isFormEnd = line => line === `--${boundary}--`;

  const parts = [];
  let partHeaders = {};
  let partData = [];
  let state = 'preamble';
  let bytes = [];

  Array.from(bodyBuffer).forEach((byte) => {
    if (state === 'epilogue') {
      return;
    }

    bytes.push(byte);

    if (!isLineFeed(byte)) {
      return;
    }

    const line = stringFromBytes(bytes).trim();

    switch (state) {
      case 'preamble':
        if (isFormSep(line)) {
          state = 'partHeaders';
        }
        break;
      case 'partHeaders':
        if (line) {
          const [key, val] = line.split(':').map(s => s.trim());
          partHeaders[key] = val;
        } else {
          state = 'partData';
        }
        break;
      case 'partData':
        if (isFormSep(line) || isFormEnd(line)) {
          const part = createFormPart(partHeaders, partData.slice(0, -2));
          parts.push(part);
          partHeaders = {};
          partData = [];
          state = isFormEnd(line) ? 'epilogue' : 'partHeaders';
        } else {
          partData.push(...bytes);
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
    .filter(p => p.filename !== undefined)
    .reduce((acc, p) => ({ ...acc, [p.name]: p }), {});

  const fields = parts
    .filter(p => p.filename === undefined)
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
  const boundary = getBoundary(headers);
  return parseBody(body, boundary);
};

/**
 * @module {Object} parser
 */
export default {
  parse,
  parseBody,
  getBoundary
};

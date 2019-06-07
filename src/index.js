import get from './utils/get-ignore-case';
import parseHeaderOpts from './utils/parse-header-options';
import isLineFeed from './utils/is-line-feed';
import stringFromBytes from './utils/string-from-bytes';

const createFormPart = (headers, data) => {
  const header = get(headers, 'Content-Disposition');
  const { name, filename } = parseHeaderOpts(header);

  if (filename === undefined) {
    const value = stringFromBytes(data);
    return { name, value };
  }

  const contentType = get(headers, 'Content-Type') || '';
  const type = contentType.split(';')[0] || 'application/octet-stream';
  const { charset } = parseHeaderOpts(header);
  const contentEncoding = get(headers, 'Content-Transfer-Encoding') || '';
  const encoding = contentEncoding.split(';')[0];
  const content = Buffer.from(data);

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
  let state = 'before';
  let bytes = [];

  Array.from(bodyBuffer).forEach((byte) => {
    if (state === 'after') {
      return;
    }

    bytes.push(byte);

    if (!isLineFeed(byte)) {
      return;
    }

    const line = stringFromBytes(bytes);

    switch (state) {
      case 'before':
        if (isFormSep(line)) {
          state = 'headers';
        }
        break;
      case 'headers':
        if (line) {
          const [key, val] = line.split(':').map(s => s.trim());
          partHeaders[key] = val;
        } else {
          state = 'data';
        }
        break;
      case 'data':
        if (isFormSep(line) || isFormEnd(line)) {
          const part = createFormPart(partHeaders, partData);
          parts.push(part);
          partHeaders = {};
          partData = [];
          state = isFormEnd(line) ? 'after' : 'headers';
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

const parseBody = (body, boundary) => {
  const parts = getFormParts(body, boundary);

  const files = parts
    .filter(p => p.filename)
    .reduce((acc, p) => ({ ...acc, [p.name]: p }), {});

  const fields = parts
    .filter(p => p.filename === undefined)
    .reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {});

  return { files, fields };
};

const getBoundary = (headers) => {
  const header = get(headers, 'Content-Type');
  const opts = parseHeaderOpts(header);
  return get(opts, 'boundary');
};

const parse = (request) => {
  const { headers, body } = request;
  const boundary = getBoundary(headers);
  return parseBody(body, boundary);
};

export default {
  parse,
  parseBody,
  getBoundary
};

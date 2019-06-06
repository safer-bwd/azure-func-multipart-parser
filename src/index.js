import getIgnoreCase from './utils/get-ignore-case';
import parseHeaderOpts from './utils/parse-header-options';
import isLineFeed from './utils/is-line-feed';
import stringFromBytes from './utils/string-from-bytes';

const createFormItem = (headers, data) => {
  const header = getIgnoreCase(headers, 'Content-Disposition');
  const { name, filename } = parseHeaderOpts(header);

  let item;
  if (filename) {
    const type = getIgnoreCase(headers, 'Content-Type');
    const encode = getIgnoreCase(headers, 'Content-Transfer-Encoding');
    const content = Buffer.from(data);
    item = {
      name, filename, type, encode, content
    };
  } else {
    const value = stringFromBytes(data);
    item = { name, value };
  }

  return item;
};

const parseFormItems = (body, boundary) => {
  const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);

  const isFormSep = line => line === `--${boundary}`;
  const isFormEnd = line => line === `--${boundary}--`;

  const items = [];
  let itemHeaders = {};
  let itemData = [];
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
          itemHeaders[key] = val;
        } else {
          state = 'data';
        }
        break;
      case 'data':
        if (isFormSep(line) || isFormEnd(line)) {
          const item = createFormItem(itemHeaders, itemData);
          items.push(item);
          itemHeaders = {};
          itemData = [];
          state = isFormEnd(line) ? 'after' : 'headers';
        } else {
          itemData.push(...bytes);
        }
        break;
      default:
        throw new Error(`Unexpected state '${state}'`);
    }

    bytes = [];
  });

  return items;
};

const parseBody = (body, boundary) => {
  const formItems = parseFormItems(body, boundary);

  const files = formItems
    .filter(p => p.filename)
    .reduce((acc, p) => ({ ...acc, [p.name]: p }), {});

  const fields = formItems
    .filter(p => !p.filename)
    .reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});

  return { files, fields };
};

const getBoundary = (headers) => {
  const header = getIgnoreCase(headers, 'Content-Type');
  const opts = parseHeaderOpts(header);
  return getIgnoreCase(opts, 'boundary');
};

const parse = (request) => {
  const { headers, body } = request;
  const boundary = getBoundary(headers);
  return parseBody(body, boundary);
};

export default {
  parse
};

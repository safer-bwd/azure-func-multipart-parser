import getIgnoreCase from './utils/get-ignore-case';
import parseHeaderOpts from './utils/parse-header-options';

const getBoundary = (headers) => {
  const header = getIgnoreCase(headers, 'Content-Type');
  const opts = parseHeaderOpts(header);
  return getIgnoreCase(opts, 'boundary');
}

const parseBody = (body, boundary) => {
}

const parse = (request) => {
  const { headers, body } = request;
  const boundary = getBoundary(headers);
  return parseBody(body, boundary);
};

export default {
  parse
};

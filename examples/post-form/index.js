const { parse } = require('azure-func-multipart-parser');

module.exports = async (ctx) => {
  const { fields } = parse(ctx.req);
  ctx.log.warn('Form fields:', fields);
  return fields;
};

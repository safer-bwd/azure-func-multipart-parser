const fs = require('fs');
const path = require('path');

module.exports = (ctx) => {
  const filepath = path.resolve(__dirname, 'form.html');
  fs.readFile(filepath, 'utf-8', (err, content) => {
    if (err) {
      ctx.done(err);
    }
    const response = {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      body: content
    };
    ctx.done(err, response);
  });
};

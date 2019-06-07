const fs = require('fs');
const path = require('path');

const { parse } = require('../src');

it('should parse form with fields', () => {
  const bodyLines = [
    '--boundary',
    'Content-Disposition: form-data; name="name"',
    '',
    'Jon Snow',
    '--boundary',
    'Content-Disposition: form-data; name="age"',
    '',
    '23',
    '--boundary--',
    ''
  ];
  const request = {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=boundary'
    },
    body: Buffer.from(bodyLines.join('\r\n'))
  };

  const { fields } = parse(request);
  expect(fields).toEqual({ name: 'Jon Snow', age: '23' });
});

it('should parse form with file#1', () => {
  const bodyLines = [
    '--boundary',
    'Content-Disposition: form-data; name="file"; filename="test.txt"',
    'Content-Type: text/plain; charset="utf-8"',
    '',
    'test',
    'test',
    '--boundary--',
    ''
  ];
  const request = {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=boundary'
    },
    body: Buffer.from(bodyLines.join('\r\n'))
  };

  const { files } = parse(request);
  const { file } = files;
  expect(file.filename).toEqual('test.txt');
  expect(file.type).toEqual('text/plain');
  expect(file.charset).toEqual('utf-8');
  expect(file.content.toString()).toEqual('test\r\ntest');
});

const fs = require('fs');
const path = require('path');

const { parse } = require('../src');
const stringFromBytes = require('../src/utils/string-from-bytes');

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
    body: Buffer.from(bodyLines.join('\n'))
  };

  const { fields } = parse(request);
  expect(fields).toEqual({ name: 'Jon Snow', age: '23' });
});

it('should parse form with text file', () => {
  const bodyLines = [
    '--boundary',
    'Content-Disposition: form-data; name="file"; filename="test.txt"',
    'Content-Type: text/plain',
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
  const fileContent = stringFromBytes(Array.from(file.content));
  expect(fileContent).toEqual('test\r\ntest');
});

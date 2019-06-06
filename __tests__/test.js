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
    '--boundary--'
  ];
  const request = {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=boundary'
    },
    body: Buffer.from(bodyLines.join('\r\n'))
  }

  const {fields} = parse(request);
  expect(fields).toEqual({name: 'Jon Snow', age: '23'});
});

it('should parse form with files', () => {
  const fileBuffer = fs.readFileSync(path.join(__dirname, './_fixtures/test.xlsx'));
  const bodyLines = [
    '--boundary',
    'Content-Disposition: form-data; name="file"; filename="test.xlsx"',
    '',
    `${fileBuffer.toString('binary')}`,
    '--boundary--'
  ];
  const request = {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=boundary'
    },
    body: Buffer.from(bodyLines.join('\r\n'))
  }

  const {files} = parse(request);
  const {file} = files;
  expect(file.filename).toEqual('test.xlsx');
  expect(Buffer.compare(fileBuffer, file.contenr)).toEqual(0);
});

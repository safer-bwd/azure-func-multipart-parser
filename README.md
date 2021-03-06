# azure-func-multipart-parser

[![Build Status](https://travis-ci.com/safer-bwd/azure-func-multipart-parser.svg?branch=master)](https://travis-ci.com/safer-bwd/azure-func-multipart-parser)

Multipart form parser for Azure Functions JS 2.0.

Azure Functions JS 2.0 do not support _streams_ and using libraries like [multiparty](https://github.com/pillarjs/multiparty) or [multer](https://github.com/expressjs/multer) may not be easy.
So you can use this simple parser.

**Note:**
Do not use multipart forms with big files in Azure Functions JS 2.0.

## Install

```sh
npm install azure-func-multipart-parser --save
```

## Usage

function.json

```json
{
  "bindings": [
    {
      "name": "req",
      "type": "httpTrigger",
      "direction": "in",
      "dataType": "binary"
    }
  ]
}
```

index.js

```javascript
const { parse } = require('azure-func-multipart-parser');

module.exports = async (ctx) => {
  const { fields, files } = parse(ctx.req);
  // ...
};
```

 See [examples](examples).

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [parser](#parser)
    -   [isMultipartForm](#ismultipartform)
        -   [Parameters](#parameters)
    -   [getBoundary](#getboundary)
        -   [Parameters](#parameters-1)
    -   [parseBody](#parsebody)
        -   [Parameters](#parameters-2)
    -   [parse](#parse)
        -   [Parameters](#parameters-3)
-   [resultOfParsing](#resultofparsing)
    -   [Properties](#properties)
    -   [fileObject](#fileobject)
        -   [Properties](#properties-1)

### parser

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### isMultipartForm

Checks if it is a request with multipart form

##### Parameters

-   `headers` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The object of headers (`request.headers`)

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

#### getBoundary

Get a boundary from request headers

##### Parameters

-   `headers` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The object of headers (`request.headers`)

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### parseBody

Parse a body with multipart form

##### Parameters

-   `body` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Buffer](https://nodejs.org/api/buffer.html))** The request body (`request.body`)
-   `boundary` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The multipart form boundary

Returns **[resultOfParsing](#resultofparsing)** 

#### parse

Parse a multipart form

##### Parameters

-   `request` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The request object

Returns **[resultOfParsing](#resultofparsing)** 

### resultOfParsing

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `fields` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;sting, sting>** 
-   `files` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;sting, fileObject>** 

#### fileObject

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

##### Properties

-   `filename` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The file name
-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The content type
-   `charset` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The charset
-   `encoding` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The transfer encoding
-   `content` **[Buffer](https://nodejs.org/api/buffer.html)** The file content

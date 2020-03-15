# @barchart/common-node-js

A *public* library of shared JavaScript utilities. These utilities only suitable for Node.js environments.

### Overview

#### Features

* Several promise-based convenience wrappers for the AWS SDK (including DynamoDB, S3, SES, SNS, SQS)
* Pluggable Asynchronous Message Bus for Request-Response (including an Amazon SQS implementation)
* Pluggable Asynchronous Message Bus for Publish-Subscribe (including an Amazon SNS/SQS implementation)
* Quick HTTP servers with REST and/or Socket.IO endpoints (using Express)
* Some Utilities for Node.js streams
* Browse the code...

#### Companion Library

A companion library called [@barchart/common-js](https://github.com/barchart/barchart-common-js) contains a more general set of utilities which are suitable for either Node.js or browser environments.

### Development

#### Documentation

The code is documented with [JSDoc](http://usejsdoc.org/). While the output hasn't been committed to source control, you can generate the documentation by using the following commands:

    > npm install
    > gulp document

#### Package Managers

This library has been published as a *public* module to NPM as [@barchart/common-node-js](https://www.npmjs.com/package/@barchart/common-node-js).

    > npm login
    > npm install @barchart/common-node-js -S

#### License

This software is provided under the MIT license.
# barchart-common-node-js
## Common classes, utilities, and functions for exclusively for Node.js servers

This library can serve as the foundation for Node.js servers.

Features include:

* Several promise-based convenience wrappers for the AWS SDK (including DynamoDB, S3, SES, SNS, SQS)
* Asynchronous Message Bus for Request-Response (with Amazon SQS implementation)
* Asynchronous Message Bus for Request-Response (with Amazon SNS SQS implementation)
* Quick HTTP servers with REST and/or Socket.IO endpoints (using Express)
* Some Utilities for Node.js streams
* More

## Documentation

The code is documented with [JSDoc](http://usejsdoc.org/). While the output hasn't been committed to source control, you can generate the documentation by using the following commands:

    > npm install
    > gulp document

## Development

Gulp is used to check "linting" and run unit tests, as follows:

    > npm install
    > gulp lint
    > gulp test

## License

This software is provided under the MIT license.
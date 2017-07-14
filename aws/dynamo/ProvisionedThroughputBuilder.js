const assert = require('common/lang/assert');

const DataType = require('./DataType'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/ProvisionedThroughput');

	class ProvisionedThroughput {
		constructor(read, write) {
			assert.argumentIsOptional(read, 'read', Number);
			assert.argumentIsOptional(write, 'write', Number);

			this._read = read;
			this._write = write;
		}

		get read() {
			return this._read;
		}

		get write() {
			return this._write;
		}

		withRead(value) {
			assert.argumentIsRequired(value, 'value', Number);

			this._read = value;

			return this;
		}

		withWrite(value) {
			assert.argumentIsRequired(value, 'value', Number);

			this._write = value;

			return this;
		}

		validate() {
			if (!is.integer(this._read)) {
				throw new Error('Read capacity must be an integer.');
			}

			if (this._read < 0) {
				throw new Error('Read capacity must be positive');
			}

			if (!is.integer(this._write)) {
				throw new Error('Write capacity must be an integer.');
			}

			if (this._write < 0) {
				throw new Error('Write capacity must be positive');
			}
		}

		static fromDefaults() {
			return new ProvisionedThroughput(1, 1);
		}

		toString() {
			return '[ProvisionedThroughput]';
		}
	}

	return ProvisionedThroughput;
})();
const assert = require('common/lang/assert');

const DataType = require('./DataType'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/CapacityUnitsBuilder');

	class CapacityUnitsBuilder {
		constructor(read, write) {
			assert.argumentIsOptional(read, 'read', Number);
			assert.argumentIsOptional(write, 'write', Number);

			this._read = read;
			this._write = write;
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

		get read() {
			return this._read;
		}

		get write() {
			return this._write;
		}

		getIsValid() {
			return is.number(this._read) && this._read > 0 && is.number(this._write) && this._write > 0;
		}

		static withDefaults() {
			return new CapacityUnitsBuilder(1, 1);
		}

		toString() {
			return '[CapacityUnitsBuilder]';
		}
	}

	return CapacityUnitsBuilder;
})();
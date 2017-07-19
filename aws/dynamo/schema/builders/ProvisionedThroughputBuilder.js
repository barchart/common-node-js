const assert = require('common/lang/assert');

const DataType = require('./../definitions/DataType'),
	KeyType = require('./../definitions/KeyType'),
	ProvisionedThroughput = require('./../definitions/ProvisionedThroughput');

module.exports = (() => {
	'use strict';

	class ProvisionedThroughputBuilder {
		constructor(read, write) {
			assert.argumentIsOptional(read, 'read', Number);
			assert.argumentIsOptional(write, 'write', Number);

			this._provisionedThroughput = new ProvisionedThroughput(read, write);
		}

		get provisionedThroughput() {
			return this._provisionedThroughput;
		}

		withRead(value) {
			assert.argumentIsRequired(value, 'value', Number);

			this._provisionedThroughput = new ProvisionedThroughput(value, this._provisionedThroughput.write);

			return this;
		}

		withWrite(value) {
			assert.argumentIsRequired(value, 'value', Number);

			this._provisionedThroughput = new ProvisionedThroughput(this._provisionedThroughput.read, value);

			return this;
		}

		toString() {
			return '[ProvisionedThroughputBuilder]';
		}
	}

	return ProvisionedThroughputBuilder;
})();
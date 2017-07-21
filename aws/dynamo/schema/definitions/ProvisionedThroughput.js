const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	class ProvisionedThroughput {
		constructor(read, write) {
			this._read = read;
			this._write = write;
		}

		get read() {
			return this._read;
		}

		get write() {
			return this._write;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
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

		toProvisionedThroughputSchema() {
			return {
				ReadCapacityUnits: this._read,
				WriteCapacityUnits: this._write
			};
		}

		static getDefault() {
			return new ProvisionedThroughput(1, 1);
		}

		toString() {
			return '[ProvisionedThroughput]';
		}
	}

	return ProvisionedThroughput;
})();
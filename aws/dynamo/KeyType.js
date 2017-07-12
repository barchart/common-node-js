const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/KeyType');

	class KeyType {
		constructor(code, description) {
			assert.argumentIsRequired(code, 'code', String);
			assert.argumentIsRequired(description, 'description', String);

			this._code = code;
			this._description = description;
		}

		get code() {
			return this._code;
		}

		get description() {
			return this._description;
		}

		static get HASH() {
			return keyTypeHash;
		}

		static get RANGE() {
			return keyTypeRange;
		}

		toString() {
			return `[KeyType (code=${this._code}, description=${this._description})]`;
		}
	}

	const keyTypeHash = new DataType('HASH', 'Hash');
	const keyTypeRange = new DataType('RANGE', 'Range');

	return KeyType;
})();
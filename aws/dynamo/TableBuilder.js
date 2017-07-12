const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const CapacityUnitsBuilder = require('./CapacityUnitsBuilder'),
	KeyBuilder = require('./KeyBuilder'),
	KeyType = requrie('./KeyType');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/TableBuilder');

	class TableBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._keyBuilders = [ ];
			this._capacityUnitsBuilder = null;
		}

		withKey(name, dataType, keyType) {
			const proposed = KeyBuilder.withName(name)
				.withDataType(dataType)
				.withKeyType(keyType);

			if (this._keyBuilders.some(k => k.name === proposed.name)) {
				throw new Error(`Unable to add key, another key definition exists for the same [${proposed.name}]`);
			}

			if (this._keyBuilders.some(k => k.keyType === proposed.keyType)) {
				throw new Error(`Unable to add key, another key definition exists for the same key type [${proposed.keyType.code}]`);
			}

			this._keyBuilders.push(proposed);

			return this;
		}

		withReadCapacityUnits(value) {
			assert.argumentIsRequired(value, 'value', Number);

			this._readCapacityUnits = value;

			return this;
		}

		withWriteCapacityUnits(value) {
			assert.argumentIsRequired(value, 'value', Number);

			this._writeCapacityUnits = value;

			return this;
		}



		getIsValid() {
			return is.string(this._name) && this._keyBuilders.filter(k => k.keyType === KeyType.HASH).length === 1;
		}

		static withName(name) {
			return new TableBuilder(name);
		}

		toString() {
			return '[TableBuilder]';
		}
	}

	return TableBuilder;
})();
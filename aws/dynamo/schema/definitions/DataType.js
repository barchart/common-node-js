const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	class DataType {
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

		static get STRING() {
			return dataTypeString;
		}

		static get NUMBER() {
			return dataTypeNumber;
		}

		static fromCode(code) {
			assert.argumentIsRequired(code, 'code', String);

			return dataTypes.find(dt => dt.code === code);
		}

		toString() {
			return `[DataType (code=${this._code}, description=${this._description})]`;
		}
	}

	const dataTypeString = new DataType('S', 'String');
	const dataTypeNumber = new DataType('N', 'Number');

	const dataTypes = [ dataTypeString, dataTypeNumber ];

	return DataType;
})();
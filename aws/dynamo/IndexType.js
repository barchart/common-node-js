const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	class IndexType {
		constructor(description, schemaName, separateProvisioning) {
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsRequired(schemaName, 'schemaName', String);
			assert.argumentIsRequired(separateProvisioning, 'separateProvisioning', Boolean);

			this._description = description;
			this._schemaName = schemaName;
			this._separateProvisioning = separateProvisioning;
		}

		get description() {
			return this._description;
		}

		get schemaName() {
			return this._schemaName;
		}

		get separateProvisioning() {
			return this._separateProvisioning;
		}

		static get GLOBAL_SECONDARY() {
			return indexTypeGlobal;
		}

		static get LOCAL_SECONDARY() {
			return indexTypeLocal;
		}

		toString() {
			return `[IndexType (description=${this._description})]`;
		}
	}

	const indexTypeGlobal = new IndexType('GlobalSecondaryIndex', 'GlobalSecondaryIndexes', true);
	const indexTypeLocal = new IndexType('LocalSecondaryIndex', 'LocalSecondaryIndexes', false);

	const indexTypes = [ indexTypeGlobal, indexTypeLocal ];

	return IndexType;
})();
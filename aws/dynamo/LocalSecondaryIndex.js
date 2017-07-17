const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Index = require('./Index.js');

module.exports = (() => {
	'use strict';

	class LocalSecondaryIndex extends Index {
		constructor(name, keys, projection) {
			super(name, 'LocalSecondaryIndex', keys, projection);
		}

		validate() {
			super.validate();
		}

		toLocalSecondaryIndexSchema() {
			return this.toIndexSchema();
		}

		toString() {
			return `[LocalSecondaryIndex (name=${this._name})]`;
		}
	}

	return LocalSecondaryIndex;
})();
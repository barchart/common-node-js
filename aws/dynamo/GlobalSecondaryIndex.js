const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Index = require('./Index.js');

module.exports = (() => {
	'use strict';

	class GlobalSecondaryIndex extends Index {
		constructor(name, keys, projection, provisionedThroughput) {
			super(name, 'GlobalSecondaryIndex', keys, projection);

			this._provisionedThroughput = provisionedThroughput;
		}

		get provisionedThroughput() {
			return this._provisionedThroughput;
		}

		toString() {
			return `[GlobalSecondaryIndex (name=${this._name})]`;
		}
	}

	return GlobalSecondaryIndex;
})();
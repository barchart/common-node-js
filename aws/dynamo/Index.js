const assert = require('common/lang/assert'),
	is = require('common/lang/is');

module.exports = (() => {
	'use strict';

	class Key {
		constructor() {

		}

		toString() {
			return '[Index]';
		}
	}

	return Key;
})();
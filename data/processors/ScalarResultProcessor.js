var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/ScalarResultProcessor');

	class ScalarResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			let result;

			if (is.array(results)) {
				if (results.length === 0) {
					result = undefined;
				} else if (results.length === 1) {
					result = results[0];
				} else {
					throw new Error('Data provider returned multiple results when scalar value was expected.');
				}
			} else {
				result = results;
			}

			return result;
		}

		toString() {
			return '[ScalarResultProcessor]';
		}
	}

	return ScalarResultProcessor;
})();
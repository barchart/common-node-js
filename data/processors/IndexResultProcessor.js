var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/MapToObjectResultProcessor');

	const extractOne = item => 1;

	/**
	 * Converts an array to an object, assuming each item in the array has
	 * a property with a unique value.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 */
	class MapToObjectResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			let returnRef = null;

			if (is.array(results)) {

			} else {
				returnRef = null;
			}

			return returnRef;
		}

		toString() {
			return '[MapToObjectResultProcessor]';
		}
	}

	return MapToObjectResultProcessor;
})();
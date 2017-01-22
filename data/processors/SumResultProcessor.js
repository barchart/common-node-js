var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/Average');

	/**
	 * Sums an array.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 * @param {string=} configuration.propertyName - If the array contains objects, this is the name of the numeric property to average.
	 */
	class SumResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			let returnVal = null;

			if (is.array(results)) {
				returnVal = 0;

				if (results.length > 0) {
					const configuration = this._getConfiguration();
					const propertyName = configuration.propertyName;

					let extract;

					if (is.string(propertyName)) {
						extract = item => attributes.read(item, propertyName);
					} else {
						extract = item => item;
					}

					for (let i = 0; i < results.length; i++) {
						const value = extract(results[i]);

						if (is.number(value)) {
							returnVal = returnVal + value;
						} else {
							returnVal = null;

							break;
						}
					}
				}
			}

			return returnVal;
		}

		toString() {
			return '[SumResultProcessor]';
		}
	}

	return SumResultProcessor;
})();
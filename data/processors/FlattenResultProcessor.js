const log4js = require('log4js');

const is = require('common/lang/is');

const ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FlattenResultProcessor');

	/**
	 * Flattens an array of arrays.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration - Not used.
	 */
	class FlattenResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			if (is.undefined(results) || is.null(results)) {
				return [];
			}

			if (!is.array(results)) {
				throw new Error('Unable to aggregate results, input must be an array.');
			}

			let aggregate = [ ];

			return aggregate.concat.apply(aggregate, results);
		}

		toString() {
			return '[FlattenResultProcessor]';
		}
	}

	return FlattenResultProcessor;
})();
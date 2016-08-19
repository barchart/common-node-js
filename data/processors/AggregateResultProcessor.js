var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/AggregateResultProcessor');

	class AggregateResultProcessor extends ResultProcessor {
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
			return '[AggregateResultProcessor]';
		}
	}

	return AggregateResultProcessor;
})();
var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/ExtractResultProcessor');

	class ExtractResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			if (is.undefined(results) || is.null(results)) {
				return [];
			}

			if (!is.array(results)) {
				throw new Error('Unable to extract results, input must be an array.');
			}

			const configuration = this._getConfiguration();
			const propertyName = configuration.propertyName;

			if (!is.string(propertyName) || propertyName.length === 0) {
				return results;
			}

			return results.map((item) => {
				return attributes.read(item, propertyName);
			});
		}

		toString() {
			return '[ExtractResultProcessor]';
		}
	}

	return ExtractResultProcessor;
})();
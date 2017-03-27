const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/UnwrapResultProcessor');

	class UnwrapResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();
			const propertyName = configuration.propertyName;

			let returnRef;

			if (is.string(propertyName) && propertyName.length !== 0) {
				returnRef = attributes.read(results, propertyName);
			} else {
				returnRef = results;
			}

			return returnRef;
		}

		toString() {
			return '[UnwrapResultProcessor]';
		}
	}

	return UnwrapResultProcessor;
})();
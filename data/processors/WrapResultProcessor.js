const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/WrapResultProcessor');

	class WrapResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			const propertyName = configuration.propertyName;
			const wrapArray = is.boolean(configuration.wrapArray) && configuration.wrapArray;

			let returnRef;

			if (!is.string(propertyName) || propertyName.length === 0) {
				returnRef = results;
			} else if (wrapArray) {
				if (is.array(results)) {
					returnRef = results.map((item) => {
						return wrap(propertyName, item);
					});
				} else {
					returnRef = [ ];
				}
			} else {
				returnRef = wrap(propertyName, results);
			}

			return returnRef;
		}

		toString() {
			return '[WrapResultProcessor]';
		}
	}

	function wrap(propertyName, item) {
		const returnRef = { };

		attributes.write(returnRef, propertyName, item);

		return returnRef;
	}

	return WrapResultProcessor;
})();
var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/UppercaseResultProcessor');

	class UppercaseResultProcessor extends MutateResultProcessor.extend{
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;
			const propertyValue = attributes.read(resultItemToProcess, propertyName);

			let convertedValue;

			if (is.array(propertyValue)) {
				convertedValue = propertyValue.map(convertToUppercase);
			} else {
				convertedValue = convertToUppercase(propertyValue);
			}

			attributes.write(resultItemToProcess, propertyName, convertedValue);
		}

		toString() {
			return '[UppercaseResultProcessor]';
		}
	}

	function convertToUppercase(target) {
		let returnRef;

		if (is.string(target)) {
			returnRef = target.toUpperCase();
		} else {
			returnRef = target;
		}

		return returnRef;
	}

	return UppercaseResultProcessor;
})();
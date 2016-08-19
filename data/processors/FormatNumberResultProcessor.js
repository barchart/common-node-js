var log4js = require('log4js');
var numeral = require('numeral');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FormatNumberResultProcessor');

	class FormatNumberResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			let propertyName = configurationToUse.propertyName;
			let propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (is.string(propertyValue)) {
				propertyValue = parseFloat(propertyValue);
			}

			if (is.number(propertyValue)) {
				attributes.write(resultItemToProcess, propertyName, numeral(propertyValue).format(configurationToUse.format));
			}
		}

		toString() {
			return '[FormatNumberResultProcessor]';
		}
	}

	return FormatNumberResultProcessor;
})();
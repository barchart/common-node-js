var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	const logger = log4js.getLogger('data/processors/OverwriteResultProcessor');

	class OverwriteResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			attributes.write(resultItemToProcess, configurationToUse.propertyName, configurationToUse.overwriteValue);
		}

		toString() {
			return '[OverwriteResultProcessor]';
		}
	}

	return OverwriteResultProcessor;
}();
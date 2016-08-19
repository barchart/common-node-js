var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/CopyResultProcessor');

	class CopyResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			let targetPropertyNames;

			if (is.string(configurationToUse.targetPropertyName)) {
				targetPropertyNames = [configurationToUse.targetPropertyName];
			} else if (is.array(configurationToUse.targetPropertyNames)) {
				targetPropertyNames = configurationToUse.targetPropertyNames;
			} else {
				targetPropertyNames = [];
			}

			let sourcePropertyValue = attributes.read(resultItemToProcess, configurationToUse.sourcePropertyName);

			if (is.string(sourcePropertyValue) && configurationToUse.regex) {
				let matches = sourcePropertyValue.match(new RegExp(configurationToUse.regex));
				let matchedValue;

				if (is.array(matches) && matches.length !== 0) {
					matchedValue = matches[0];
				} else {
					matchedValue = '';
				}

				sourcePropertyValue = matchedValue;
			}

			targetPropertyNames.forEach((targetPropertyName) => {
				attributes.write(resultItemToProcess, targetPropertyName, sourcePropertyValue);
			});
		}

		toString() {
			return '[CopyResultProcessor]';
		}
	}

	return CopyResultProcessor;
})();
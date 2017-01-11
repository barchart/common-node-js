var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/ConcatenateResultProcessor');

	class ConcatenateResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			let targetPropertyName = configurationToUse.targetPropertyName;

			if (!is.string(targetPropertyName)) {
				return;
			}

			let source;

			if (is.string(configurationToUse.source)) {
				source = [configurationToUse.source];
			} else if (is.array(configurationToUse.source)) {
				source = configurationToUse.source;
			} else {
				source = [];
			}

			const data = source.map((sourcePropertyName) => {
				let returnRef;

				if (attributes.has(resultItemToProcess, sourcePropertyName)) {
					returnRef = attributes.read(resultItemToProcess, sourcePropertyName).toString();
				} else {
					returnRef = sourcePropertyName;
				}

				return returnRef;
			});

			attributes.write(resultItemToProcess, targetPropertyName, data.join(''));
		}

		toString() {
			return '[ConcatenateResultProcessor]';
		}
	}

	return ConcatenateResultProcessor;
})();
var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/SelectResultProcessor');

	class SelectResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			if (configuration.properties) {
				let resultsToProcess;

				if (is.array(results)) {
					resultsToProcess = results;
				} else {
					resultsToProcess = [ results ];
				}

				resultsToProcess = resultsToProcess.map((result) => {
					var transform = {};

					Object.keys(configuration.properties)
						.forEach((inputPropertyName) => {
							const outputPropertyName = configuration.properties[inputPropertyName];

							attributes.write(transform, outputPropertyName, attributes.read(result, inputPropertyName));
						});

					return transform;
				});

				if (is.array(results)) {
					results = resultsToProcess;
				} else {
					results = resultsToProcess[0];
				}
			}

			return results;
		}

		toString() {
			return '[SelectResultProcessor]';
		}
	}

	return SelectResultProcessor;
})();
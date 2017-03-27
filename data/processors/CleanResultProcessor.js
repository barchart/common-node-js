const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const MutateResultProcessor = require('./MutateResultProcessor');

/**
 * Delete properties that are null or undefined.
 *
 * @public
 * @extends ResultProcessor
 * @param {object} configuration
 * @param {object} configuration.propertyName
 */
module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/CleanResultProcessor');

	class CleanResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;

			let target;

			if (is.string(propertyName)) {
				target = attributes.read(resultItemToProcess, propertyName);

				if (is.null(target) || is.undefined(target)) {
					attributes.erase(resultItemToProcess, propertyName);
				}
			} else {
				target = resultItemToProcess;
			}

			if (is.object(target)) {
				for (let p in target) {
					const value = target[p];

					if (is.null(value) || is.undefined(value)) {
						delete target[p];
					}
				}
			}
		}

		toString() {
			return '[CleanResultProcessor]';
		}
	}

	return CleanResultProcessor;
})();
const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/ReplaceLiteralResultProcessor');

	/**
	 * Performs a literal string replacement.
	 *
	 * @public
	 * @extends MutateResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName
	 * @param {string=} configuration.selectVal - The literal string to search for.
	 * @param {string=} configuration.selectRef - The name of the property that contains the string to search for.
	 * @param {string=} configuration.replaceVal - The replacement string.
	 * @param {string=} configuration.replaceRef - The name of the property that contains the replacement string.
	 */
	class ReplaceLiteralResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;
			const propertyValue = attributes.read(resultItemToProcess, propertyName);
			
			if (is.string(propertyValue)) {
				let selectString;
				
				if (is.string(configurationToUse.selectVal)) {
					selectString = configurationToUse.selectVal;
				} else if (is.string(configurationToUse.selectRef) && attributes.has(resultItemToProcess, configurationToUse.selectRef)) {
					selectString = attributes.read(resultItemToProcess, configurationToUse.selectRef);
				} else {
					selectString = null;
				}
				
				let replaceString;
	
				if (is.string(configurationToUse.replaceVal)) {
					replaceString = configurationToUse.replaceVal;
				} else if (is.string(configurationToUse.replaceRef) && attributes.has(resultItemToProcess, configurationToUse.replaceRef)) {
					replaceString = attributes.read(resultItemToProcess, configurationToUse.replaceRef);
				} else {
					replaceString = null;
				}
	
				if (!is.string(replaceString)) {
					replaceString = null;
				}
				
				if (is.string(selectString) && is.string(replaceString)) {
					attributes.write(resultItemToProcess, propertyName, propertyValue.replace(selectString, replaceString));
				}
			}
		}

		toString() {
			return '[ReplaceLiteralResultProcessor]';
		}
	}

	return ReplaceLiteralResultProcessor;
})();
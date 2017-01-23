var log4js = require('log4js');

var marketDataUtilities = require('marketdata-api-js/lib/util/index');
var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

/**
 * Formats a numeric property using Barchart's price formatting rules.
 *
 * @public
 * @interface
 * @extends MutateResultProcessor
 * @param {object} configuration
 * @param {string=} configuration.unitCode - The Barchart "unit code" value.
 * @param {string=} configuration.unitCodePropertyName - The name of the property that contains the Barchart "unit code" value.
 * @param {string=} configuration.baseCode - The Barchart "unit code" value.
 * @param {string=} configuration.baseCodePropertyName - The name of the property that contains the Barchart "unit code" value.
 * @param {string=} configuration.fractionSeparator - The fraction separator to use (usually a dash character).
 * @param {string=} configuration.fractionSeparatorPropertyName - The name of the property that contains the "fraction separator" value.
 * @param {boolean=} configuration.specialFractions - Indicates if a special mode should be used to format prices.
 * @param {string=} configuration.specialFractionsPropertyName - The name of the property that contains the "special fractions" value.
 * @param {string=} configuration.zeroOverride - If true, zero values will be formatted as this string.
 * @param {boolean=} configuration.usePlusPrefix =  If true, a plus sign will be prepended to positive values (or zero).
 */
module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FormatPriceResultProcessor');

	class FormatPriceResultProcessor extends MutateResultProcessor {
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
				let unitCode;
				let baseCode;

				if (is.string(configurationToUse.unitCode)) {
					unitCode = configurationToUse.unitCode;
				} else if (is.string(configurationToUse.unitCodePropertyName)) {
					unitCode = attributes.read(resultItemToProcess, configurationToUse.unitCodePropertyName);
				} else if (is.string(configurationToUse.baseCode)) {
					baseCode = configurationToUse.baseCode;
				} else if (is.string(configurationToUse.baseCodePropertyName)) {
					baseCode = attributes.read(resultItemToProcess, configurationToUse.baseCodePropertyName);
				}

				if (!is.string(unitCode)) {
					if (is.string(baseCode)) {
						baseCode = parseFloat(baseCode);
					}

					if (is.number(baseCode)) {
						unitCode = marketDataUtilities.convertBaseCodeToUnitCode(baseCode);
					}
				}

				if (is.string(unitCode)) {
					let fractionSeparator;

					if (is.string(configurationToUse.fractionSeparator)) {
						fractionSeparator = configurationToUse.fractionSeparator;
					} else if (is.string(configurationToUse.fractionSeparatorPropertyName)) {
						fractionSeparator = attributes.read(resultItemToProcess, configurationToUse.fractionSeparatorPropertyName);
					} else {
						fractionSeparator = '.';
					}

					let specialFractions;

					if (is.string(configurationToUse.specialFractions)) {
						specialFractions = configurationToUse.specialFractions;
					} else if (is.string(configurationToUse.specialFractionsPropertyName)) {
						specialFractions = attributes.read(resultItemToProcess, configurationToUse.specialFractionsPropertyName);
					} else {
						specialFractions = false;
					}

					let zeroOverride;

					if (is.string(configurationToUse.zeroOverride)) {
						zeroOverride = configurationToUse.zeroOverride;
					} else {
						zeroOverride = null;
					}

					let formattedPrice;

					if (propertyValue === 0 && is.string(zeroOverride)) {
						formattedPrice = zeroOverride;
					} else {
						formattedPrice = this._formatPrice(fractionSeparator, specialFractions, propertyValue, unitCode);

						if (is.boolean(configurationToUse.usePlusPrefix) && configurationToUse.usePlusPrefix && !(propertyValue < 0) && zeroOverride !== null) {
							formattedPrice = '+' + formattedPrice;
						}
					}

					attributes.write(resultItemToProcess, propertyName, formattedPrice);
				}
			}
		}

		_formatPrice(fractionSeparator, specialFractions, valueToFormat, unitCode, zeroOverride) {
			return FormatPriceResultProcessor.format(fractionSeparator, specialFractions, valueToFormat, unitCode, zeroOverride);
		}

		toString() {
			return '[FormatPriceResultProcessor]';
		}

		static format(fractionSeparator, specialFractions, valueToFormat, unitCode, zeroOverride) {
			const priceFormatter = new marketDataUtilities.PriceFormatter(fractionSeparator, specialFractions, zeroOverride);

			return priceFormatter.format(valueToFormat, unitCode);
		}
	}

	return FormatPriceResultProcessor;
})();
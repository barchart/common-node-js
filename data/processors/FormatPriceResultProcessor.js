var log4js = require('log4js');

var marketDataUtilities = require('marketdata-api-js/lib/util/index');
var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

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
					} else if (is.string(configurationToUse.fractionSeparatorProperty)) {
						fractionSeparator = attributes.read(resultItemToProcess, configurationToUse.fractionSeparatorProperty);
					} else {
						fractionSeparator = '.';
					}

					let specialFractions;

					if (is.string(configurationToUse.specialFractions)) {
						specialFractions = configurationToUse.specialFractions;
					} else if (is.string(configurationToUse.specialFractionsProperty)) {
						specialFractions = attributes.read(resultItemToProcess, configurationToUse.specialFractionsProperty);
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
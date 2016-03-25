var _ = require('lodash');
var log4js = require('log4js');

var marketDataUtilities = require('marketdata-api-js/lib/util/index');
var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/FormatPriceResultProcessor');

	var FormatPriceResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;
			var propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (_.isString(propertyValue)) {
				propertyValue = parseFloat(propertyValue);
			}

			if (_.isNumber(propertyValue) && !_.isNaN(propertyValue)) {
				var unitCode;
				var baseCode;

				if (_.isString(configurationToUse.unitCode)) {
					unitCode = configurationToUse.unitCode;
				} else if (_.isString(configurationToUse.unitCodePropertyName)) {
					unitCode = attributes.read(resultItemToProcess, configurationToUse.unitCodePropertyName);
				} else if (_.isString(configurationToUse.baseCode)) {
					baseCode = configurationToUse.baseCode;
				} else if (_.isString(configurationToUse.baseCodePropertyName)) {
					baseCode = attributes.read(resultItemToProcess, configurationToUse.baseCodePropertyName);
				}

				if (!_.isString(unitCode)) {
					if (_.isString(baseCode)) {
						baseCode = parseFloat(baseCode);
					}

					if (_.isNumber(baseCode)) {
						unitCode = marketDataUtilities.convertBaseCodeToUnitCode(baseCode);
					}
				}

				if (_.isString(unitCode)) {
					var fractionSeparator;

					if (_.isString(configurationToUse.fractionSeparator)) {
						fractionSeparator = configurationToUse.fractionSeparator;
					} else if (_.isString(configurationToUse.fractionSeparatorProperty)) {
						fractionSeparator = attributes.read(resultItemToProcess, configurationToUse.fractionSeparatorProperty);
					} else {
						fractionSeparator = '.';
					}

					var specialFractions;

					if (_.isString(configurationToUse.specialFractions)) {
						specialFractions = configurationToUse.specialFractions;
					} else if (_.isString(configurationToUse.specialFractionsProperty)) {
						specialFractions = attributes.read(resultItemToProcess, configurationToUse.specialFractionsProperty);
					} else {
						specialFractions = false;
					}

					var zeroOverride;

					if (_.isString(configurationToUse.zeroOverride)) {
						zeroOverride = configurationToUse.zeroOverride;
					} else {
						zeroOverride = null;
					}

					var formattedPrice;

					if (propertyValue === 0 && _.isString(zeroOverride)) {
						formattedPrice = zeroOverride;
					} else {
						formattedPrice = this._formatPrice(fractionSeparator, specialFractions, propertyValue, unitCode);

						if (_.isBoolean(configurationToUse.usePlusPrefix) && configurationToUse.usePlusPrefix && !(propertyValue < 0) && zeroOverride !== null) {
							formattedPrice = '+' + formattedPrice;
						}
					}

					attributes.write(resultItemToProcess, propertyName, formattedPrice);
				}
			}
		},

		_formatPrice: function(fractionSeparator, specialFractions, valueToFormat, unitCode, zeroOverride) {
			var priceFormatter = new marketDataUtilities.PriceFormatter(fractionSeparator, specialFractions, zeroOverride);

			return priceFormatter.format(valueToFormat, unitCode);
		},

		toString: function() {
			return '[FormatPriceResultProcessor]';
		}
	});

	return FormatPriceResultProcessor;
}();
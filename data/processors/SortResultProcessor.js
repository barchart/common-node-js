var _ = require('lodash');
var log4js = require('log4js');
var attributes = require('common/lang/attributes');

var assert = require('common/lang/assert');
var ComparatorBuilder = require('common/collections/sorting/ComparatorBuilder');
var comparators = require('common/collections/sorting/comparators');
var converters = require('common/lang/converters');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/SortResultProcessor');

	var SortResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);

			var properties;

			if (configuration.property) {
				properties = [ configuration.property ];
			} else if (_.isArray(configuration.properties)) {
				properties = configuration.properties;
			} else {
				properties = [ ];
			}

			if (properties.length !== 0) {
				var comparatorBuilder;

				for (var i = 0; i < properties.length; i++) {
					var property = properties[i];

					var comparator = getComparator(property.type, property.name);
					var invert = property.invert === true;

					if (comparator) {
						if (i === 0) {
							comparatorBuilder = ComparatorBuilder.startWith(comparator, invert);
						} else {
							comparatorBuilder = comparatorBuilder.thenBy(comparator, invert);
						}
					}
				}

				this._comparator = comparatorBuilder.toComparator();
			} else {
				this._comparator = null;
			}
		},

		_process: function(results) {
			if (_.isFunction(this._comparator)) {
				results.sort(this._comparator);
			}

			return results;
		},

		toString: function() {
			return '[SortResultProcessor]';
		}
	});

	function getComparator(propertyTypeName, propertyName) {
		assert.argumentIsRequired(propertyTypeName, 'propertyTypeName', String);
		assert.argumentIsRequired(propertyName, 'propertyName', String);

		var upperCase = propertyTypeName.toUpperCase();

		var comparator;
		var converter;

		if (upperCase === 'STRING') {
			comparator = comparators.compareStrings;
			converter = converters.empty;
		} else if (upperCase === 'NUMBER') {
			comparator = comparators.compareNumbers;
			converter = converters.empty;
		} else if (upperCase === 'DATE') {
			comparator = comparators.compareDates;
			converter = converters.toDate;
		} else {
			logger.warn('Result processor was not configured properly. Unable to sort property type (', propertyTypeName, ')');

			comparator = comparators.empty;
			converter = converters.empty;
		}

		return function(itemA, itemB) {
			var valueA = converter(attributes.read(itemA, propertyName));
			var valueB = converter(attributes.read(itemB, propertyName));

			return comparator(valueA, valueB);
		};
	}

	return SortResultProcessor;
}();
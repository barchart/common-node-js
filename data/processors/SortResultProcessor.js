var log4js = require('log4js');
var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var assert = require('common/lang/assert');
var ComparatorBuilder = require('common/collections/sorting/ComparatorBuilder');
var comparators = require('common/collections/sorting/comparators');
var converters = require('common/lang/converters');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/SortResultProcessor');

	class SortResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);

			let properties;

			if (configuration.property) {
				properties = [configuration.property];
			} else if (is.array(configuration.properties)) {
				properties = configuration.properties;
			} else {
				properties = [];
			}

			if (properties.length !== 0) {
				let comparatorBuilder;

				properties.forEach((property, i) => {
					const comparator = getComparator(property.type, property.name);
					const invert = property.invert === true;

					if (comparator) {
						if (i === 0) {
							comparatorBuilder = ComparatorBuilder.startWith(comparator, invert);
						} else {
							comparatorBuilder = comparatorBuilder.thenBy(comparator, invert);
						}
					}
				});

				this._comparator = comparatorBuilder.toComparator();
			} else {
				this._comparator = null;
			}
		}

		_process(results) {
			if (is.fn(this._comparator)) {
				results.sort(this._comparator);
			}

			return results;
		}

		toString() {
			return '[SortResultProcessor]';
		}
	}

	function getComparator(propertyTypeName, propertyName) {
		assert.argumentIsRequired(propertyTypeName, 'propertyTypeName', String);
		assert.argumentIsRequired(propertyName, 'propertyName', String);

		const upperCase = propertyTypeName.toUpperCase();

		let comparator;
		let converter;

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

		return (itemA, itemB) => {
			const valueA = converter(attributes.read(itemA, propertyName));
			const valueB = converter(attributes.read(itemB, propertyName));

			return comparator(valueA, valueB);
		};
	}

	return SortResultProcessor;
})();
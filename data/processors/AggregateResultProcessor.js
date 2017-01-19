var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

var AverageResultProcessor = require('./AverageResultProcessor');
var SumResultProcessor = require('./SumResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/AggregateResultProcessor');

	class AggregateResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			if (!is.array(results)) {
				return results;
			}

			const configuration = this._getConfiguration();

			if (!is.string(configuration.groupBy)) {
				return [ ];
			}

			let groupingPropertyName = configuration.groupBy;

			const root = [ ];

			results.forEach((item) => {
				let names = attributes.read(item, groupingPropertyName);

				names.reduce((groups, name) => {
					let group = groups.find(group => group.name === name);

					if (!is.object(group)) {
						group = {
							name: name,
							groups: [ ],
							items: [ ]
						};

						groups.push(group);
					}

					group.items.push(item);

					return group.groups;
				}, root);
			}, [ ]);

			let aggregations = configuration.aggregations || [ ];

			if (aggregations.length > 0) {

			}

			return root;
		}

		toString() {
			return '[AggregateResultProcessor]';
		}
	}

	function getSum(items, propertyName) {
		return items.reduce((sum, item) => sum + attributes.read(item, propertyName));
	}

	function getAverage(items, propertyName) {
		if (items.length === 0) {
			return 0;
		}

		return getSum(items, propertyName) / items.length;
	}

	function getWeightedAverage(items, sumProperty, weightProperty) {
		if (items.length === 0) {
			return 0;
		}

		const weightTotal = getSum(items, weightProperty);
		const weightedSum = items.reduce((sum, item) => sum + attributes.read(item, sumProperty) * attributes.read(item, weightProperty));

		return weightedSum / weightTotal;
	}

	return AggregateResultProcessor;
})();
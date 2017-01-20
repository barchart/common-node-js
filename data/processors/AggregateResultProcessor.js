var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');
var SumResultProcessor = require('./SumResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/AggregateResultProcessor');

	const aggregationProcessors = {
		'SumResultProcessor': SumResultProcessor
	};

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

			const groupingPropertyName = configuration.groupBy;

			const aggregations = configuration.aggregate || [ ];
			const aggregateInner = configuration.aggregateInnerNodes || false;

			const root = {
				groups: [ ]
			};

			results.forEach((item) => {
				let names = attributes.read(item, groupingPropertyName);

				names.reduce((groups, name, index) => {
					let group = groups.find(group => group.name === name);

					if (!is.object(group)) {
						group = {
							name: name,
							groups: [ ]
						};

						groups.push(group);
					}

					if (aggregateInner || names.length === index + 1) {
						group.items = group.items || [ ];
						group.items.push(item);
					}

					return group.groups;
				}, root.groups);
			}, [ ]);

			if (aggregations.length > 0) {
				const aggregateGroups = (node) => {
					node.groups.forEach((child) => {
						if (aggregateInner || child.groups.length === 0) {
							child.totals = aggregations.reduce((totals, configuration) => {
								const processorName = configuration.processor;
								const resultPropertyName = configuration.resultPropertyName;

								if (is.string(processorName) && is.string(resultPropertyName) && aggregationProcessors.hasOwnProperty(processorName)) {
									const Processor = aggregationProcessors[processorName];
									const processor = new Processor(configuration);

									attributes.write(totals, `${resultPropertyName}`, processor._process(child.items));
								}

								return totals;
							}, {});
						}

						aggregateGroups(child);
					});
				};

				aggregateGroups(root);
			}

			return root;
		}

		toString() {
			return '[AggregateResultProcessor]';
		}
	}


	return AggregateResultProcessor;
})();
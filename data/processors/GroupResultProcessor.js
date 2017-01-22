var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/GroupResultProcessor');

	class GroupResultProcessor extends ResultProcessor {
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

			return root;
		}

		toString() {
			return '[GroupResultProcessor]';
		}
	}

	return GroupResultProcessor;
})();
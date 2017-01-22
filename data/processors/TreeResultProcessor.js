var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/TreeResultProcessor');

	/**
	 * Groups an array of objects into a tree structure, based on an
	 * array read from each item.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.groupBy - The name of the item property that contains the structure (e.g. [ 'Animals', 'Mammals', 'Cat' ])
	 * @param {boolean=} configuration.groupInnerNodes - If true, each tree node will have an "items" array. Otherwise, only the leaf nodes will have an "items" array.
	 */
	class TreeResultProcessor extends ResultProcessor {
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
			const groupInnerNodes = configuration.groupInnerNodes || false;

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

					if (groupInnerNodes || names.length === index + 1) {
						group.items = group.items || [ ];
						group.items.push(item);
					}

					return group.groups;
				}, root.groups);
			}, [ ]);

			return root;
		}

		toString() {
			return '[TreeResultProcessor]';
		}
	}

	return TreeResultProcessor;
})();
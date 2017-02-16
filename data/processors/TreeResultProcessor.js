var log4js = require('log4js');

var array = require('common/lang/array');
var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/TreePathResultProcessor');

	/**
	 * Takes an array and generates a tree structure.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 * @param {string=} configuration.pathPropertyName - The name of the item property that contains it's proper location in the tree structure (e.g. [ 'Animals', 'Mammals', 'Cat' ])
	 * @param {Array<string>=} configuration.pathPropertyNames
	 * @param {boolean=} configuration.itemizeInnerNodes - If true, each tree node will have an "items" array. Otherwise, only the leaf nodes will have an "items" array.
	 */
	class TreePathResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			const pathPropertyName = configuration.pathPropertyName;
			const pathPropertyNames = configuration.pathPropertyNames;

			let pathExtractor;

			if (is.string(configuration.pathPropertyName)) {
				pathExtractor = item => attributes.read(item, pathPropertyName);
			} else {
				pathExtractor = item => pathPropertyNames.map((pathPropertyName) => attributes.read(item, pathPropertyName));
			}
			
			const itemizeInnerNodes = configuration.itemizeInnerNodes || false;

			const root = {
				children: [ ],
				parent: null
			};

			if (itemizeInnerNodes) {
				root.items = results;
			}

			results.forEach((item) => {
				let names = pathExtractor(item);

				names.reduce((parent, name, index) => {
					const children = parent.children;

					let child = children.find(group => group.name === name);

					if (!is.object(child)) {
						child = {
							parent: parent,
							name: name,
							children: [ ]
						};

						children.push(child);
					}

					if (itemizeInnerNodes || names.length === index + 1) {
						child.items = child.items || [ ];
						child.items.push(item);
					}

					return child;
				}, root);
			}, [ ]);

			return root;
		}

		toString() {
			return '[TreePathResultProcessor]';
		}
	}

	return TreePathResultProcessor;
})();
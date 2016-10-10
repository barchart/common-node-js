var log4js = require('log4js');

var array = require('common/lang/array');
var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/JoinResultProcessor');

	class JoinResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			const target = attributes.read(results, configuration.target);
			const source = attributes.read(results, configuration.source);

			let targetProperty;
			let sourceProperty;

			if (is.string(configuration.targetProperty) && is.string(configuration.sourceProperty)) {
				targetProperty = configuration.targetProperty;
				sourceProperty = configuration.sourceProperty;
			} else {
				targetProperty = configuration.join;
				sourceProperty = configuration.join;
			}

			const aliasProperty = configuration.alias;

			let sourceItemMap;

			const keySelector = (item) => {
				return attributes.read(item, sourceProperty);
			};

			if (is.boolean(configuration.multiple) && is.boolean(configuration.multiple)) {
				sourceItemMap = array.groupBy(source, keySelector);
			} else {
				sourceItemMap = array.indexBy(source, keySelector);
			}

			target.forEach((targetItem) => {
				let targetValue;

				if (is.array(targetItem[targetProperty])) {
					const joinValues = targetItem[targetProperty];

					targetValue = joinValues.map((joinValue) => {
						return sourceItemMap[joinValue];
					});
				} else {
					const joinValue = targetItem[targetProperty];

					targetValue = sourceItemMap[joinValue];
				}

				attributes.write(targetItem, aliasProperty, targetValue);
			});

			return target;
		}

		toString() {
			return '[JoinResultProcessor]';
		}
	}

	return JoinResultProcessor;
})();
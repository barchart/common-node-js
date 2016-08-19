var log4js = require('log4js');

var array = require('common/lang/array');
var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/DistinctResultProcessor');

	class DistinctResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.string(configuration.property)) {
				const propertyName = configuration.property;

				let wrap;

				if (is.boolean(configuration.wrap)) {
					wrap = configuration.wrap;
				} else {
					wrap = true;
				}

				const items =
					array.unique(
						results.reduce((accumulator, result) => {
							const value = attributes.read(result, propertyName);

							if (is.array(value)) {
								value.forEach((item) => {
									accumulator.push(item);
								});
							} else {
								accumulator.push(value);
							}

							return accumulator;
						}, [ ])
					);

				if (wrap) {
					returnRef = items.map((item) => {
						const wrapper = {};

						wrapper[propertyName] = item;

						return wrapper;
					});
				} else {
					returnRef = items;
				}
			} else {
				returnRef = results;
			}

			return returnRef;
		}

		toString() {
			return '[DistinctResultProcessor]';
		}
	}

	return DistinctResultProcessor;
})();
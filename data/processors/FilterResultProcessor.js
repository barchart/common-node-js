var log4js = require('log4js');
var moment = require('moment');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterResultProcessor');

	class FilterResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			if (is.object(configuration.equals)) {
				results = results.filter((result) => {
					return Object.keys(configuration.equals)
						.every((propertyName) => {
							const expectedValue = configuration.equals[propertyName];

							return attributes.has(result, propertyName) && attributes.read(result, propertyName) === expectedValue;
						});
				});
			}

			if (is.object(configuration.regex)) {
				results = results.filter((result) => {
					return Object.keys(configuration.regex)
						.every((propertyName) => {
							const regex = new RegExp(configuration.regex[propertyName]);

							return attributes.has(result, propertyName) && regex.test(attributes.read(result, propertyName));
						});
				});
			}

			if (is.array(configuration.empty)) {
				results = results.filter((result) => {
					return configuration.empty
						.every((propertyName) => {
							let returnVal;

							if (attributes.has(result, propertyName)) {
								const value = attributes.read(result, propertyName);

								returnVal = is.null(value) || is.undefined(value) || value === '';
							} else {
								returnVal = true;
							}

							return returnVal;
						});
				});
			}

			if (is.object(configuration.unique)) {
				results = results.filter((result, resultIndex) => {
					return results.some((other, otherIndex) => {
						return !(otherIndex < resultIndex && configuration.unique.every((propertyName) => {
							return attributes.has(result, propertyName) && attributes.has(other, propertyName) && attributes.read(result, propertyName) === attributes.read(other, propertyName);
						}));
					});
				});
			}

			if (is.object(configuration.special)) {
				const now = moment();

				results = results.filter((result) => {
					return Object.keys(configuration.special)
						.every((propertyName) => {
							const specialOperation = configuration.special[propertyName];

							let returnVal = attributes.has(result, propertyName);

							if (returnVal) {
								const propertyValue = attributes.read(result, propertyName);

								if (specialOperation === 'today') {
									const m = moment(propertyValue);

									returnVal = m.isValid() &&
										m.year() === now.year() &&
										m.month() === now.month() &&
										m.date() === now.date();
								}
							}

							return returnVal;
						});
				});
			}

			return results;
		}

		toString() {
			return '[FilterResultProcessor]';
		}
	}

	return FilterResultProcessor;
})();
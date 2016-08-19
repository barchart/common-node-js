var log4js = require('log4js');

var assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/ResultProcessor');

	class ResultProcessor {
		constructor(configuration) {
			this._configuration = configuration || {};
		}

		_getConfiguration() {
			return this._configuration;
		}

		process(results) {
			return Promise.resolve()
				.then(() => {
					return this._process(results);
				});
		}

		_process(results) {
			return results;
		}

		toString() {
			return '[ResultProcessor]';
		}

		static toFunction(resultProcessor) {
			assert.argumentIsRequired(resultProcessor, 'resultProcessor', ResultProcessor, 'ResultProcessor');

			return (results) => {
				return resultProcessor.process(results);
			};
		}
	}

	return ResultProcessor;
})();
var log4js = require('log4js');

var assert = require('common/lang/assert');

var QueryProvider = require('./QueryProvider');
var ResultProcessor = require('./ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/DataProvider');

	class DataProvider {
		constructor(queryProvider, resultProcessor) {
			assert.argumentIsRequired(queryProvider, 'queryProvider', QueryProvider, 'QueryProvider');
			assert.argumentIsRequired(resultProcessor, 'resultProcessor', ResultProcessor, 'ResultProcessor');

			this._queryProvider = queryProvider;
			this._resultProcessor = resultProcessor;
		}

		getData(criteria) {
			return this._queryProvider.runQuery(criteria)
				.then((data) => {
					return this._resultProcessor.process(data);
				});
		}

		getCriteriaIsValid(criteria) {
			return this._queryProvider.getCriteriaIsValid(criteria);
		}

		toString() {
			let resultProcessorString;

			if (this._resultProcessor) {
				resultProcessorString = this._resultProcessor.toString();
			} else {
				resultProcessorString = '[none]';
			}

			return `[DataProvider (QueryProvider=${this._queryProvider.toString()}, ResultProcessor=${resultProcessorString})]`;
		}
	}

	return DataProvider;
})();
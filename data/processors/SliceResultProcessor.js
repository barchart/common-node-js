var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/SliceArrayProcessor');

	class SliceArrayProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			let result;

			let start = configuration.start;
			let end = configuration.end;

			if (is.number(start) && is.array(results)) {
				if (is.number(end)) {
					end = configuration.end;
				} else {
					end = undefined;
				}

				result = results.slice(start, end);
			} else {
				result = results;
			}

			return result;
		}

		toString() {
			return '[SliceArrayProcessor]';
		}
	}

	return SliceArrayProcessor;
})();
var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/PartitionResultProcessor');

	class PartitionResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			if (is.undefined(results) || is.null(results)) {
				return [];
			}

			if (!is.array(results)) {
				throw new Error('Unable to partition results, input must be an array.');
			}

			const configuration = this._getConfiguration();

			let partitionSize = configuration.size;

			if (is.string(partitionSize)) {
				partitionSize = parseInt(partitionSize);
			}

			partitionSize = partitionSize || 10;

			const original = results.slice(0);
			const partitions = [ ];

			while (original.length !== 0) {
				partitions.push(original.splice(0, partitionSize));
			}

			return partitions;
		}

		toString() {
			return '[PartitionResultProcessor]';
		}
	}

	return PartitionResultProcessor;
})();
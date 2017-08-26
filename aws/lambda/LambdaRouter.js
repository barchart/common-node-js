const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert');

const LambdaProcessor = require('./LambdaProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('lambda/LambdaRouter');

	/**
	 * A {@link LambdaProcessor} implementation that cycles through an
	 * internal list of {@link LambdaProcessor} instances and executes
	 * the first valid instance.
	 *
	 * @public
	 * @param {Array<LambdaProcessor>}
	 * @extends LambdaProcessor
	 */
	return class LambdaRouter extends LambdaProcessor {
		constructor(processors) {
			super();

			assert.argumentIsArray(processors, 'processors', LambdaProcessor, 'LambdaProcessor');

			this._processors = processors;
		}

		_canProcess(message, environment, components, logger) {
			return this._processors.some(p => p.canProcess(message, environment, components, logger));
		}

		_process(message, environment, components, logger) {
			const processor = this._processors.find(p => p.canProcess(message, environment, components, logger));

			return processor.process(message, environment, components, logger);
		}

		toString() {
			return `[LambdaRouter]`;
		}
	};
})();
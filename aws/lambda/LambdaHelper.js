const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Enum = require('@barchart/common-js/lang/Enum'),
	is = require('@barchart/common-js/lang/is');

const LambdaEventParser = require('./LambdaEventParser'),
	LambdaResponder = require('./LambdaResponder'),
	LambdaStage = require('./LambdaStage');

const FailureReason = require('@barchart/common-js/api/failures/FailureReason'),
	FailureType = require('@barchart/common-js/api/failures/FailureType'),
	LambdaFailureType = require('./LambdaFailureType');

const LambdaEventValidator = require('./LambdaEventValidator');

module.exports = (() => {
	'use strict';

	/**
	 * Static helper utilities for a Lambda function.
	 *
	 * @public
	 */
	class LambdaHelper {
		constructor() {

		}

		/**
		 * Configures and returns a log4js lambdaLogger.
		 *
		 * @public
		 * @param {Object=|String=} configuration - Configuration path (as string) or a configuration data (as object).
		 * @returns {Object}
		 */
		static getLogger(configuration) {
			if (lambdaLogger === null) {
				log4js.configure(configuration);

				lambdaLogger = log4js.getLogger('LambdaHelper');
				eventLogger = log4js.getLogger('LambdaHelper/Event');
			}

			return lambdaLogger;
		}

		/**
		 * Builds and returns a new {@link LambdaEventParser}.
		 *
		 * @public
		 * @param {Object} event
		 * @returns {LambdaEventParser}
		 */
		static getEventParser(event) {
			return new LambdaEventParser(event);
		}

		/**
		 * Builds and returns a new {@link LambdaEventValidator}.
		 *
		 * @public
		 * @returns {LambdaEventValidator}
		 */
		static getEventValidator(context) {
			return new LambdaEventValidator();
		}

		/**
		 * Builds and returns a new {@link LambdaResponder}.
		 *
		 * @public
		 * @param {Function} callback
		 * @returns {LambdaResponder}
		 */
		static getResponder(callback) {
			return new LambdaResponder(callback);
		}

		/**
		 * Builds and returns a new {@link LambdaStage}.
		 *
		 * @public
		 * @param {String} stage
		 * @returns {LambdaStage}
		 */
		static getStage(stage) {
			assert.argumentIsRequired(stage, 'stage', String);

			return Enum.fromCode(LambdaStage, stage);
		}

		/**
		 * Starts a promise chain for the Lambda function, invoking the suppressor, then
		 * the processor, and responding with the processor's result.
		 *
		 * @public
		 * @param {String} description - Human-readable description of the operation.
		 * @param {Object} event - The Lambda's event data.
		 * @param {Function} callback - The Lambda's callback function.
		 * @param {LambdaHelper~processor} processor - The processor that is invoked to perform the work.
		 * @returns {Promise}
		 */
		static process(description, event, callback, processor) {
			let parser;
			let validator;
			let responder;

			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(description, 'description', String);
					assert.argumentIsRequired(processor, 'processor', Function);

					parser = LambdaHelper.getEventParser(event);
					responder = LambdaHelper.getResponder(callback);
					validator = LambdaHelper.getEventValidator();

					if (parser.plainText) {
						responder.setPlainText();
					}

					if (is.object(event) && eventLogger && eventLogger.isTraceEnabled()) {
						eventLogger.trace(JSON.stringify(event, null, 2));
					}

					return validator.process(event)
						.then((messages) => {
							if (messages.some(m => m.valid)) {
								return processor(parser, responder);
							} else {
								const reason = new FailureReason()
									.addItem(LambdaFailureType.LAMBDA_INVOCATION_SUPPRESSED);

								return Promise.reject(reason);
							}
						});
				}).then((response) => {
					responder.send(response);
				}).catch((e) => {
					let failure;

					if (e instanceof FailureReason) {
						failure = e;

						if (lambdaLogger) {
							lambdaLogger.error(failure.format());
						}
					} else {
						failure = FailureReason.forRequest({ endpoint: { description: description }})
							.addItem(FailureType.REQUEST_GENERAL_FAILURE);

						if (lambdaLogger) {
							lambdaLogger.error(e);
						}
					}

					if (is.object(event) && eventLogger && !eventLogger.isTraceEnabled()) {
						eventLogger.warn(JSON.stringify(event, null, 2));
					}

					if (responder) {
						responder.sendError(failure);
					}
				});
		}

		toString() {
			return 'LambdaHelper';
		}
	}

	let lambdaLogger = null;
	let eventLogger = null;

	/**
	 * A callback used to execute the Lambda operation's work.
	 *
	 * @public
	 * @callback LambdaHelper~processor
	 * @param {LambdaEventParser} parser
	 * @param {LambdaResponder} responder
	 */

	/**
	 * A callback used to determine if processing should be suppressed.
	 *
	 * @public
	 * @callback LambdaHelper~suppressor
	 * @param {LambdaEventParser} parser
	 * @param {LambdaResponder} responder
	 * @param {Object=} logger
	 * @returns {Promise}
	 */

	return LambdaHelper;
})();

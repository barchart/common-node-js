const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Enum = require('@barchart/common-js/lang/Enum'),
	is = require('@barchart/common-js/lang/is');

const S3Provider = require('./../S3Provider');

const LambdaEventParser = require('./LambdaEventParser'),
	LambdaResponder = require('./LambdaResponder'),
	LambdaSecretsManager = require('./LambdaSecretsManager'),
	LambdaStage = require('./LambdaStage');

const FailureReason = require('@barchart/common-js/api/failures/FailureReason'),
	FailureType = require('@barchart/common-js/api/failures/FailureType'),
	LambdaFailureType = require('./LambdaFailureType');

const LambdaValidator = require('./LambdaValidator');

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
		 * Configures and returns a log4js logger.
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
		 * Returns secret value from AWS Secrets Manager.
		 *
		 * @public
		 * @param {String} secretId
		 * @return {Promise<String>}
		 */
		static getSecretValue(secretId) {
			assert.argumentIsRequired(secretId, 'secretId', String);

			return LambdaSecretsManager.INSTANCE.getValue(secretId);
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
		 * Builds and returns a new {@link LambdaValidator}.
		 *
		 * @public
		 * @returns {LambdaValidator}
		 */
		static getValidator() {
			return new LambdaValidator();
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
		 * Starts and returns a new {@link S3Provider} used for handling large responses.
		 *
		 * @public
		 * @return {Promise<S3Provider>}
		 */
		static getS3ProviderForResponse() {
			return getS3ProviderForResponse();
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
					validator = LambdaHelper.getValidator();

					if (parser.plainText) {
						responder.setPlainText();
					}

					if (is.object(event) && eventLogger && eventLogger.isTraceEnabled()) {
						eventLogger.trace(JSON.stringify(event, null, 2));
					}

					return validator.process(event)
						.then((messages) => {
							const suppressed = messages.filter((message) => !message.valid);

							if (lambdaLogger && suppressed.length !== 0) {
								lambdaLogger.warn(`Some messages have been flagged as invalid [ ${suppressed.map(s => s.id).join(',')} ]`);
							}

							if (suppressed.length === messages.length) {
								const reason = new FailureReason()
									.addItem(LambdaFailureType.LAMBDA_INVOCATION_SUPPRESSED);

								return Promise.reject(reason);
							} else {
								return processor(parser, responder);
							}
						});
				}).then((response) => {
					return responder.send(response);
				}).catch((e) => {
					let failure;

					if (e instanceof FailureReason) {
						failure = e;

						if (lambdaLogger) {
							if (e.getIsSevere()) {
								lambdaLogger.error(failure.format());
							} else {
								lambdaLogger.warn(failure.format());
							}
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
						responder.sendError(failure, failure.getErrorCode());
					}
				});
		}

		toString() {
			return 'LambdaHelper';
		}
	}

	let lambdaLogger = null;
	let eventLogger = null;

	let s3ProviderForResponse = null;

	function getS3ProviderForResponse() {
		if (s3ProviderForResponse === null) {
			s3ProviderForResponse = Promise.resolve()
				.then(() => {
					const configuration = {
						region: 'us-east-1',
						bucket: 'barchart-aws-lambda-responses',
					};

					const provider = new S3Provider(configuration);

					return provider.start()
						.then(() => {
							return provider;
						});
				});
		}

		return s3ProviderForResponse;
	}

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

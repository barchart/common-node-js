const log4js = require('log4js');

const Serializer = require('common/timing/Serializer');

const HttpProvider = require('./../../network/http/HttpProvider'),
	LambdaEnvironment = require('./LambdaEnvironment'),
	SesProvider = require('./../SesProvider'),
	SnsProvider = require('./../SnsProvider'),
	SqsProvider = require('./../SqsProvider'),
	TwilioProvider = require('./../../sms/TwilioProvider');

module.exports = (() => {
	'use strict';

	log4js.configure({
		levels: {
			'[all]': 'INFO'
		},
		appenders: [ {
			type: 'console',
			layout: {
				type: 'pattern',
				pattern: '[%d] [%p] %c - %m%'
			}
		} ]
	});

	const logger = log4js.getLogger('lambda/LambdaBuilder');

	/**
	 * A builder pattern for assembling the AWS lambda functions.
	 */
	return class LambdaBuilder {
		constructor() {
			this._environment = null;

			this._messageExtractor = null;
			this._messageProcessor = null;
			this._componentInitializers = [ ];
		}

		/**
		 * Specifies the environment.
		 *
		 * @param environment {LambdaEnvironment}
		 *
		 * @returns {LambdaBuilder}
		 */
		withEnvironment(environment) {
			if (!(environment instanceof LambdaEnvironment)) {
				throw new Error('The "messageExtractor" argument must be a "LambdaEnvironment" instance');
			}

			if (this._environment !== null) {
				throw new Error('The "environment" has already been defined');
			}

			this._environment = environment;

			return this;
		}

		/**
		 * Specifies the function used "extract" the item(s) to which should be
		 * processed (see {@link LambdaBuilder#usingMessageProcessor}).
		 *
		 * @param messageExtractor {Function}
		 *
		 * @returns {LambdaBuilder}
		 */
		usingMessageExtractor(messageExtractor) {
			if (typeof messageExtractor !== 'function') {
				throw new Error('The "messageExtractor" argument must be a function');
			}

			if (this._messageExtractor !== null) {
				throw new Error('The "messageExtractor" has already been defined');
			}

			this._messageExtractor = messageExtractor;

			return this;
		}

		/**
		 * Specifies the function used "process" the item(s) input (see
		 * {@link LambdaBuilder#usingMessageExtractor}).
		 *
		 * @param messageExtractor {Function}
		 *
		 * @returns {LambdaBuilder}
		 */
		usingMessageProcessor(messageProcessor) {
			if (typeof messageProcessor !== 'function') {
				throw new Error('The "messageProcessor" argument must be a function');
			}

			if (this._messageProcessor !== null) {
				throw new Error('The "messageProcessor" has already been defined');
			}

			this._messageProcessor = messageProcessor;

			return this;
		}

		/**
		 * Specifies a function that returns a component to be used during processing
		 * (see {@link LambdaBuilder#usingMessageProcessor}).
		 *
		 * @param componentInitializer {Function} - Promise-based function that returns a "component" for use by the "processor" function.
		 * @param componentName {String} - Name of the component (in the map passed to the "processor" function.
		 *
		 * @returns {LambdaBuilder}
		 */
		usingComponentInitializer(componentInitializer, componentName) {
			if (typeof componentInitializer !== 'function') {
				throw new Error('The "componentInitializer" argument must be a function');
			}

			if (typeof componentName !== 'string') {
				throw new Error('The "componentName" argument must be a function');
			}

			if (this._componentInitializers.find((c) => c.name === componentName)) {
				throw new Error('A component initializer with the same name has already been defined');
			}

			this._componentInitializers.push({name: componentName, initializer: componentInitializer});

			return this;
		}

		/**
		 * Constructs and returns the function used for processing the Lambda function's
		 * events.
		 *
		 * @returns {function}
		 */
		build() {
			let runCounter = 0;

			const environment = this._environment || LambdaEnvironment.getInstance();

			const messageExtractor = this._messageExtractor || LambdaBuilder.getEmptyExtractor();
			const messageProcessor = this._messageProcessor || LambdaBuilder.getEmptyProcessor();
			const componentInitializers = Array.from(this._componentInitializers);

			return (event, context) => {
				let run = runCounter++;

				logger.info(`starting run ${run} for ${environment.getGroup()}:${environment.getName()} in ${environment.getMode()} mode`);

				return Promise.resolve({ })
					.then((context) => {
						logger.debug('extracting messages for run', run);

						return messageExtractor(event)
							.then((messages) => Object.assign(context, { messages: messages }));
					}).then((context) => {
						logger.debug('initializing', componentInitializers.length, 'components for run', run);

						return Promise.all(componentInitializers.map((ci) => {
							return Promise.resolve()
								.then(() => {
									return ci.initializer(environment);
								}).then((component) => {
									logger.debug('initialized', ci.name, 'component for run', run);

									return {
										name: ci.name,
										component: component
									};
								});
						})).then((items) => {
							return Object.assign(context, {
								components: items.reduce((map, item) => {
									map[item.name] = item.component;

									return map;
								}, { })
							});
						});
					}).then((context) => {
						const messages = context.messages;

						if (messages === null || messages === undefined) {
							logger.warn('aborting run', run, ', no messages to process');

							return context;
						}

						let messagesToProcess;

						if (Array.isArray(messages)) {
							messagesToProcess = messages;
						} else {
							messagesToProcess = [messages];
						}

						logger.info('processing', messagesToProcess.length, 'message(s) for run', run);

						return Promise.all(messagesToProcess.map((message, i) => {
							logger.info('processing message', (i + 1), 'for run', run);

							return messageProcessor(message, environment, context.components, logger);
						})).then(() => context);
					}).then((context) => {
						const components = context.components;

						Object.getOwnPropertyNames(components).forEach((key) => {
							const component = components[key];

							if (typeof component.dispose === 'function') {
								logger.debug('disposing', key, 'component for run', run);

								component.dispose();
							}
						});

						return context;
					}).then((context) => {
						logger.info('processing completed normally for run', run);
					}).catch((e) => {
						logger.error('processing failed for run', run);
						logger.error(e);
					}).then(() => {
						logger.info('finished run', run);

						context.done();
					});
			};
		}

		/**
		 * An extractor that returns the raw event, as passed to the AWS Lambda function
		 * (see {@link LambdaBuilder#usingMessageExtractor}).
		 *
		 * @returns {function(*)}
		 */
		static getEventExtractor() {
			return (event) => {
				return Promise.resolve([ event ]);
			};
		}

		/**
		 * An extractor that returns an array, containing one null item (see
		 * {@link LambdaBuilder#usingMessageExtractor}).
		 *
		 * @returns {function(*)}
		 */
		static getEmptyExtractor() {
			return (event) => {
				return Promise.resolve([ null ]);
			};
		}

		/**
		 * An extractor that returns an array of SNS records passed to the
		 * AWS Lambda function {@link LambdaBuilder#usingMessageExtractor}).
		 *
		 * @returns {function(*)}
		 */
		static getSnsExtractor() {
			return (event) => {
				let recordsToProcess;

				if (event && Array.isArray(event.Records)) {
					recordsToProcess = event.Records.filter((r) => r && r.Sns && typeof r.Sns.Message === 'string');
				} else {
					recordsToProcess = [ ];
				}

				return Promise.resolve(recordsToProcess.map((r) => JSON.parse(r.Sns.Message)));
			};
		}

		/**
		 * An initializer that generates a {@link HttpProvider} (see
		 * {@link LambdaBuilder#usingComponentInitializer}).
		 *
		 * @returns {function(*)}
		 */
		static getHttpInitializer() {
			return (environment) => {
				return environment.getConfiguration()
					.then((configuration) => {
						const http = new HttpProvider(configuration.http);

						return http.start().then(() => http);
					});
			};
		}

		/**
		 * An initializer that generates a {@link SnsProvider} (see
		 * {@link LambdaBuilder#usingComponentInitializer}).
		 *
		 * @returns {function(*)}
		 */
		static getSnsInitializer() {
			return (environment) => {
				return environment.getConfiguration()
					.then((configuration) => {
						if (!configuration || !configuration.aws || !configuration.aws.sns) {
							throw new Error('Configuration data for Amazon SNS is missing.');
						}

						const sns = new SnsProvider(configuration.aws.sns);

						return sns.start().then(() => sns);
					});
			};
		}

		/**
		 * An initializer that generates a {@link SqsProvider} (see
		 * {@link LambdaBuilder#usingComponentInitializer}).
		 *
		 * @returns {function(*)}
		 */
		static getSqsInitializer() {
			return (environment) => {
				return environment.getConfiguration()
					.then((configuration) => {
						if (!configuration || !configuration.aws || !configuration.aws.sqs) {
							throw new Error('Configuration data for Amazon SQS is missing.');
						}

						const sqs = new SqsProvider(configuration.aws.sqs);

						return sqs.start().then(() => sqs);
					});
			};
		}

		/**
		 * An initializer that generates a {@link SesProvider} (see
		 * {@link LambdaBuilder#usingComponentInitializer}).
		 *
		 * @returns {function(*)}
		 */
		static getSesInitializer() {
			return (environment) => {
				return environment.getConfiguration()
					.then((configuration) => {
						if (!configuration || !configuration.aws || !configuration.aws.ses) {
							throw new Error('Configuration data for Amazon SES is missing.');
						}

						const ses = new SesProvider(configuration.aws.ses);

						return ses.start().then(() => ses);
					});
			};
		}

		/**
		 * An initializer that generates a {@link TwilioProvider} (see
		 * {@link LambdaBuilder#usingComponentInitializer}).
		 *
		 * @returns {function(*)}
		 */
		static getTwilioInitializer() {
			return (environment) => {
				return environment.getConfiguration()
					.then((configuration) => {
						if (!configuration || !configuration.twilio) {
							throw new Error('Configuration data for twilio is missing.');
						}

						const twilio = new TwilioProvider(configuration.twilio);

						return twilio.start().then(() => twilio);
					});
			};
		}

		/**
		 * Returns a processor that does nothing with its input (see
		 * {@link LambdaBuilder#usingMessageProcessor}).
		 *
		 * @returns {function(*)}
		 */
		static getEmptyProcessor() {
			return (message, environment, components, logger) => {
				logger.warn('Ignoring message');
			};
		}

		static getSerializer() {
			return new Serializer();
		}

		toString() {
			return `[LambdaBuilder (group=${this._environment.getGroup()}, name=${this._environment.getName()}, environment=${this._environment.getEnvironment()}]`;
		}
	};
})();
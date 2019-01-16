const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	promise = require('@barchart/common-js/lang/promise');

module.exports = (() => {
	
	const logger = log4js.getLogger('common-node/aws/LambdaProvider');
	
	/**
	 * Wrapper for Amazon's Lambda SDK.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region
	 * @param {string=} configuration.apiVersion
	 * @param {string=} configuration.bucket
	 * @param {string=} configuration.folder
	 */
	class LambdaProvider extends Disposable {
		constructor(configuration) {
			super();
			
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);
			
			this._lambda = null;
			
			this._configuration = configuration;
			
			this._startPromise = null;
			this._started = false;
		}
		
		/**
		 * Connects to Amazon. Must be called once before using other instance
		 * functions.
		 *
		 * @public
		 * @returns {Promise.<boolean>}
		 */
		start() {
			if (this.getIsDisposed()) {
				return Promise.reject('The Lambda Provider has been disposed.');
			}
			
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
				.then(() => {
					aws.config.update({region: this._configuration.region});
					
					this._lambda = new aws.Lambda({apiVersion: this._configuration.apiVersion || '2015-03-31'});
				}).then(() => {
					logger.info('Lambda provider started');
					
					this._started = true;
					
					return this._started;
				}).catch((e) => {
					logger.error('Lambda provider failed to start', e);
					
					throw e;
				});
			}
			
			return this._startPromise;
		}
		
		invoke(functionName, newEvent) {
			assert.argumentIsRequired(functionName, 'functionName', String);
			
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);
					
					return promise.build((resolveCallback, rejectCallback) => {
						this._lambda.invoke({
							FunctionName: functionName,
							InvocationType: 'Event',
							Payload: JSON.stringify(newEvent),
						}, (err, data) => {
							if (err) {
								rejectCallback(err);
							}
							
							resolveCallback(data);
						});
					});
				})
		}
		
		_onDispose() {
			logger.debug('Lambda provider disposed');
		}
		
		toString() {
			return '[LambdaProvider]';
		}
	}
	
	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The Dynamo Provider has been disposed.');
		}
		
		if (!this._started) {
			throw new Error('The Dynamo Provider has not been started.');
		}
	}
	
	return LambdaProvider;
})();

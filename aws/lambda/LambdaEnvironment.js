const configurator = require('node-yaml-config'),
	log4js = require('log4js');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('lambda/LambdaEnvironment');

	let instance = null;

	/**
	 * An object that describes the environment of an AWS lambda function.
	 */
	return class LambdaEnvironment {
		constructor(mode, name) {
			this._mode = mode;
			this._name = name || 'Unknown';

			this._configurationPromise = null;
		}

		getMode() {
			return this._mode;
		}

		getName() {
			return this._name;
		}

		getIsProduction() {
			return this._mode === 'prod';
		}

		getConfiguration() {
			if (this._configurationPromise === null) {
				this._configurationPromise = Promise.resolve()
					.then(() => configurator.load('./config.yml', this._mode))
					.catch((e) => logger.error('Unable to load configuration'));
			}

			return this._configurationPromise;
		}

		static getInstance() {
			if (instance === null) {
				const matches = process.env.AWS_LAMBDA_FUNCTION_NAME.match(/^(.*)-(dev|stage|prod)$/);

				if (Array.isArray(matches) && matches.length === 3) {
					instance = new LambdaEnvironment(matches[2], matches[1]);
				} else {
					instance = new LambdaEnvironment('dev');
				}
			}

			return instance;
		}

		toString() {
			return `[LambdaEnvironment (name=${this.getName()}, mode=${this.getMode()}]`;
		}
	};
})();
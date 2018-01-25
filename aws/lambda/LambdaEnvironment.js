const configurator = require('node-yaml-config'),
	log4js = require('log4js');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('lambda/LambdaEnvironment');

	let instance = null;

	/**
	 * An object that describes the environment of an AWS lambda function.
	 *
	 * @public
	 * @param {String} mode - The function's mode (i.e. dev, stage, or prod).
	 * @param {String} name - The name of the lambda function.
	 */
	class LambdaEnvironment {
		constructor(mode, name) {
			this._mode = mode;
			this._name = name || 'Unknown';

			this._configurationPromise = null;
		}

		/**
		 * Returns the function's mode (i.e. dev, stage, or prod).
		 *
		 * @public
		 * @returns {String}
		 */
		getMode() {
			return this._mode;
		}

		/**
		 * Returns the name of the function.
		 *
		 * @public
		 * @returns {String}
		 */
		getName() {
			return this._name;
		}

		/**
		 * Returns true, if the function's mode is production (i.e. "prod");
		 * otherwise returns false.
		 *
		 * @public
		 * @returns {String}
		 */
		getIsProduction() {
			return this._mode === 'prod';
		}

		/**
		 * Reads the function's config.yml file and returns the contents.
		 *
		 * @public
		 * @returns {Promise.<Object>}
		 */
		getConfiguration() {
			if (this._configurationPromise === null) {
				this._configurationPromise = Promise.resolve()
					.then(() => {
						const path = process.env.CONFIG_PATH || './';

						return configurator.load(path + 'config.yml', this._mode);
					})
					.catch((e) => logger.error('Unable to load configuration'));
			}

			return this._configurationPromise;
		}

		/**
		 * Get the singleton instance for the function.
		 *
		 * @public
		 * @returns {LambdaEnvironment}
		 */
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
	}

	return LambdaEnvironment;
})();
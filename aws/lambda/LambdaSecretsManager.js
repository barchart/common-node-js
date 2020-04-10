const SecretsManagerProvider = require('./../SecretsManagerProvider');

module.exports = (() => {
	'use strict';

	/**
	 * Manages secrets from AWS Secrets Manager.
	 *
	 * @public
	 */
	class LambdaSecretsManager {
		constructor() {
			this._cache = new Map();
		}

		/**
		 * A singleton.
		 *
		 * @public
		 * @static
		 * @returns {LambdaSecretsManager}
		 */
		static get INSTANCE() {
			return instance;
		}

		/**
		 * Gets value from AWS Secrets Manager.
		 *
		 * @public
		 * @param {String} secretId
		 * @return {Promise<String>}
		 */
		getValue(secretId) {
			return getSecretsManagerProvider()
				.then((provider) => {
					let result;

					if (this._cache.has(secretId)) {
						result = Promise.resolve(this._cache.get(secretId));
					} else {
						result = provider.getSecretValue(secretId)
							.then((data) => {
								this._cache.set(secretId, data);

								return data;
							});
					}

					return result;
				});
		}
	}

	let secretsManagerProviderPromise = null;

	/**
	 * @function
	 * @private
	 * @returns {SecretsManagerProvider}
	 */
	function getSecretsManagerProvider() {
		if (secretsManagerProviderPromise === null) {
			secretsManagerProviderPromise = Promise.resolve()
				.then(() => {
					const configuration = { };

					configuration.region = process.env.SECRETS_MANAGER_REGION || 'us-east-1';

					const provider = new SecretsManagerProvider(configuration);

					return provider.start()
						.then(() => {
							return provider;
						});
				});
		}

		return secretsManagerProviderPromise;
	}

	const instance = new LambdaSecretsManager();

	return LambdaSecretsManager;
})();

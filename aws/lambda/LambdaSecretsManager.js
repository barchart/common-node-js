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
		 * @param {String} secretId
		 * @return {Promise<SecretsManager.Types.GetSecretValueResponse, AWSError>}
		 */
		getValue(secretId) {
			return Promise.resolve()
				.then(() => {
					return getSecretsManagerProvider();
				}).then((provider) => {
					let result;

					if (cache.has(secretId)) {
						result = Promise.resolve(cache.get(secretId));
					} else {
						result = provider.getSecretValue(secretId)
							.then((data) => {
								cache.set(secretId, data);

								return data;
							});
					}

					return result;
				});
		}
	}

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

	let secretsManagerProviderPromise = null;

	const cache = new Map();

	const instance = new LambdaSecretsManager();

	return LambdaSecretsManager;
})();

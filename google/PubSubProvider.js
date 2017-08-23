const log4js = require('log4js'),
	PubSub = require('@google-cloud/pubsub'),
	uuid = require('uuid');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	is = require('@barchart/common-js/lang/is'),
	object = require('@barchart/common-js/lang/object'),
	promise = require('@barchart/common-js/lang/promise');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/PubSubProvider');

	/**
	 * A facade for Google's PubSub service.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.projectId
	 */
	class PubSubProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.projectId, 'configuration.projectId', String);

			this._configuration = configuration;

			this._ps = null;

			this._startPromise = null;
			this._started = false;
		}

		/**
		 * Initializes Google services. Authentication will occur automatically with "application default credentials" Refer to
		 * {@link https://developers.google.com/identity/protocols/application-default-credentials | Google Documentation}
		 * for more information.
		 *
		 * @public
		 * @returns {Promise.<Boolean>}
		 */
		start() {
			if (this.getIsDisposed()) {
				throw new Error('The PubSub Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						return new PubSub({
							projectId: this._configuration.projectId
						});
					}).then((ps) => {
						this._ps = ps;

						logger.info('PubSub Provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('PubSub Provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		/**
		 * Returns a clone of the configuration object originally passed
		 * to the constructor.
		 *
		 * @returns {Object}
		 */
		getConfiguration() {
			if (this.getIsDisposed()) {
				throw new Error('The PubSub Provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		/**
		 * Returns the topic names from the current project.
		 *
		 * @returns {Promise.<string[]>}
		 */
		getTopics() {
			return Promise.resolve()
				.then(() => {
					checkStart.call(this);

					return this._ps.getTopics()
						.then((envelope) => {
							return envelope.reduce((topics, batch) => topics.concat(batch.map((topic) => getUnqualifiedName(topic.name))), []);
						});
				});
		}

		/**
		 * Deletes a topic, and all attached subscriptions.
		 *
		 * @param {string} name - The name of the topic to delete.
		 * @returns {Promise}
		 */
		deleteTopic(name) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(name, 'name', String);

					checkStart.call(this);

					return getTopic.call(this, name)
						.then((topic) => {
							logger.debug('Deleting PubSub topic [', name, ']');

							return getSubscriptions.call(this, topic)
								.then((subscriptions) => {
									return Promise.all(subscriptions.map((subscription) => subscription.delete().then(() => true)))
										.then(() => {
											logger.debug('Deleted', subscriptions.length, 'subscriptions to PubSub topic [', name, ']');
										});
								}).then(() => {
									return topic.delete()
										.then(() => {
											logger.info('Deleted PubSub topic [', name, ']');
										});
								});
						});
				});
		}

		/**
		 * Creates a topic, if it doesn't already exist.
		 *
		 * @param {string} name - The name of the topic to create.
		 * @returns {Promise}
		 */
		createTopic(name) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(name, 'name', String);

					checkStart.call(this);

					return getTopic.call(this, name, true)
						.then((topic) => {
							logger.info('Created PubSub topic [', name, ']');
						});
				});
		}

		/**
		 * Creates a new subscription to a topic.
		 *
		 * @param name
		 * @param callback
		 * @returns {Promise.<Disposable>}
		 */
		subscribeTopic(name, callback) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(name, 'name', String);
					assert.argumentIsRequired(callback, 'callback', Function);

					checkStart.call(this);

					return getTopic.call(this, name, true)
						.then((topic) => {
							const subscriptionInfo = {
								autoAck: true,
								encoding: 'utf-8',
								interval: 10,
							};

							return topic.subscribe(`sub-${uuid.v4()}`, subscriptionInfo)
								.then((data) => {
									const subscription = data[0];

									subscription.on('message', callback);

									return Disposable.fromAction(() => {
										subscription.delete();
									});
								});
						});
				});
		}

		publish(name, message) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(name, 'name', String);
					assert.argumentIsRequired(message, 'message');

					checkStart.call(this);

					const topic = this._ps.topic(name);

					return topic.publish(message);
				});
		}

		_onDispose() {
			logger.debug('PubSub Provider disposed');
		}

		toString() {
			return '[PubSubProvider]';
		}
	}

	function checkStart() {
		if (this.getIsDisposed()) {
			throw new Error('The PubSub Provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The PubSub Provider has not been started.');
		}
	}
	
	const topicRegex = /projects\/([^\/]+)\/topics\/([^\/]+)/;

	function getUnqualifiedName(name) {
		const matches = name.match(topicRegex);

		if (matches.length === 3) {
			return matches[2];
		} else {
			return null;
		}
	}

	function getQualifiedName(name) {
		return `projects/${this._configuration.projectId}/topics/${name}`;
	}

	function getTopic(name, create) {
		const topic = this._ps.topic(name);

		return topic.get({ autoCreate: is.boolean(create) && create })
			.then((data) => {
				const topic = data[0];

				return topic;
			});
	}

	function getSubscriptions(topic) {
		return topic.getSubscriptions()
			.then((data) => {
					const subscriptions = data[0];

					return subscriptions;
				});
			}

	return PubSubProvider;
})();
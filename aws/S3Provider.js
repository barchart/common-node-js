const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	is = require('@barchart/common-js/lang/is'),
	object = require('@barchart/common-js/lang/object'),
	promise = require('@barchart/common-js/lang/promise');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/S3Provider');

	const mimeTypes = {
		text: 'text/plain',
		html: 'text/html',
		json: 'application/json'
	};

	const encodingTypes = {
		utf8: 'utf-8'
	};

	/**
	 * Wrapper for Amazon's S3 SDK.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region
	 * @param {string=} configuration.apiVersion
	 * @param {string=} configuration.bucket
	 * @param {string=} configuration.folder
	 */
	class S3Provider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);
			assert.argumentIsOptional(configuration.bucket, 'configuration.bucket', String);
			assert.argumentIsOptional(configuration.folder, 'configuration.folder', String);

			this._s3 = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;
		}

		/**
		 * Connects to Amazon. Must be called once before using other instance
		 * functions.
		 *
		 * @public
		 * @returns {Promise<Boolean>}
		 */
		start() {
			if (this.getIsDisposed()) {
				return Promise.reject('The S3 Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._s3 = new aws.S3({apiVersion: this._configuration.apiVersion || '2006-03-01'});
					}).then(() => {
						logger.info('S3 provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('S3 provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		/**
		 * Returns a clone of the S3 configuration data used to make requests.
		 *
		 * @public
		 * @returns {*}
		 */
		getConfiguration() {
			if (this.getIsDisposed()) {
				throw new Error('The S3 Provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		/**
		 * Retrieves the contents of a bucket.
		 *
		 * @public
		 * @param {string=} prefix
		 * @param {string=} bucket
		 * @param {number=} maximum
		 * @prarm {string=} start
		 * @returns {Promise<Object[]>}
		 */
		getBucketContents(prefix, bucket, maximum, start) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					assert.argumentIsOptional(bucket, 'bucket', String);
					assert.argumentIsOptional(prefix, 'prefix', String);
					assert.argumentIsOptional(maximum, 'maximum', Number);
					assert.argumentIsOptional(start, 'start', String);

					return promise.build((resolveCallback, rejectCallback) => {
						const payload = { };

						if (bucket) {
							payload.Bucket = bucket;
						} else {
							payload.Bucket = this._configuration.bucket;
						}

						if (prefix) {
							payload.Prefix = prefix;
						}

						if (start) {
							payload.StartAfter = start;
						}

						this._s3.listObjectsV2(payload, (e, data) => {
							if (e) {
								logger.error('S3 failed to retrieve bucket contents: ', e);
								rejectCallback(e);
							} else {
								const results = data.Contents.map((item) => {
									const transformed = { };

									transformed.key = item.Key;
									transformed.size = item.Size;

									return transformed;
								});

								resolveCallback(results);
							}
						});
					});
				});
		}

		/**
		 * Gets a signed url.
		 *
		 * @public
		 * @param {string} operation
		 * @param {string} key
		 * @returns {Promise<string>}
		 */
		getSignedUrl(operation, key) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					assert.argumentIsRequired(operation, 'operation', String);
					assert.argumentIsRequired(key, 'key', String);

					return promise.build((resolveCallback, rejectCallback) => {
						const payload = { };

						payload.Bucket = this._configuration.bucket;
						payload.Key = key;

						this._s3.getSignedUrl(operation, payload, (e, url) => {
							if (e) {
								logger.error('S3 failed to get signed url: ', e);

								rejectCallback(e);
							} else {
								resolveCallback(url);
							}
						});
					});
			});
		}

		/**
		 * Uploads an object, using the bucket (and folder) specified
		 * in the provider's configuration.
		 *
		 * @public
		 * @param {string} filename
		 * @param {string|Buffer} buffer - The content to upload
		 * @param {string=} mimeType = Defaults to "text/plain"
		 * @param {boolean=} secure = Indicates if the "private" ACL applies to the object
		 * @returns {Promise<Object>}
		 */
		upload(filename, content, mimeType, secure) {
			return this.uploadObject(this._configuration.bucket, S3Provider.getQualifiedFilename(this._configuration.folder, filename), content, mimeType, secure);
		}

		/**
		 * Uploads an object.
		 *
		 * @public
		 * @param {string} bucket
		 * @param {string} filename
		 * @param {string|Buffer} buffer - The content to upload
		 * @param {string=} mimeType = Defaults to "text/plain"
		 * @param {boolean=} secure = Indicates if the "private" ACL applies to the object
		 * @returns {Promise<Object>}
		 */
		uploadObject(bucket, filename, content, mimeType, secure) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return promise.build((resolveCallback, rejectCallback) => {
						let acl;

						if (is.boolean(secure) && secure) {
							acl = 'private';
						} else {
							acl = 'public-read';
						}

						let mimeTypeToUse;

						if (is.string(mimeType)) {
							mimeTypeToUse = mimeType;
						} else if (is.string(content)) {
							mimeTypeToUse = mimeTypes.text;
						} else if (is.object) {
							mimeTypeToUse = mimeTypes.json;
						} else {
							throw new Error('Unable to automatically determine MIME type for file.');
						}

						const params = getParameters(bucket, filename, {
							ACL: acl,
							Body: ContentHandler.getHandlerFor(mimeTypeToUse).toBuffer(content),
							ContentType: mimeTypeToUse
						});

						const options = {
							partSize: 10 * 1024 * 1024,
							queueSize: 1
						};

						this._s3.upload(params, options, (e, data) => {
							if (e) {
								logger.error('S3 failed to upload object: ', e);
								rejectCallback(e);
							} else {
								resolveCallback({data: data});
							}
						});
					});
				});
		}

		/**
		 * Uploads an object through the stream.
		 *
		 * @public
		 * @param {string} bucket
		 * @param {string} key
		 * @param {stream} reader
		 * @return {Promise<Object>}
		 */
		uploadStream(bucket, key, reader) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return this._s3.upload({ Bucket: bucket, Key: key, Body: reader }).promise();
				});
		}

		/**
		 * Downloads an object, using the bucket (and folder) specified
		 * in the provider's configuration.
		 *
		 * @public
		 * @param {string} filename
		 * @param {string|Buffer} buffer - The content to upload
		 * @param {string=} mimeType = Defaults to "text/plain"
		 * @param {boolean=} secure = Indicates if the "private" ACL applies to the object
		 * @returns {Promise<Object>}
		 */
		download(filename) {
			return this.downloadObject(this._configuration.bucket, S3Provider.getQualifiedFilename(this._configuration.folder, filename));
		}

		/**
		 * Downloads an object.
		 *
		 * @public
		 * @param {string} bucket
		 * @param {string} filename
		 * @returns {Promise<Object>}
		 */
		downloadObject(bucket, filename) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return promise.build((resolveCallback, rejectCallback) => {
						this._s3.getObject(getParameters(bucket, filename), (e, data) => {
							if (e) {
								logger.error('S3 failed to get object: ', e);
								rejectCallback(e);
							} else {
								resolveCallback(ContentHandler.getHandlerFor(data.ContentType).fromBuffer(data.Body));
							}
						});
					});
				});
		}

		/**
		 * Creates a readable stream for s3 object.
		 *
		 * @public
		 * @param {string} bucket
		 * @param {string} key
		 * @return {Promise<stream.Readable>}
		 */
		createReadStream(bucket, key) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return this._s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
				});
		}

		/**
		 * Deletes an object from a bucket.
		 *
		 * @public
		 * @param {string} bucket
		 * @param {string} filename
		 * @returns {Promise<Object>}
		 */
		deleteObject(bucket, filename) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					return promise.build((resolveCallback, rejectCallback) => {
						this._s3.deleteObject(getParameters(bucket, filename), (e, data) => {
							if (e) {
								logger.error('S3 failed to delete object: ', e);
								rejectCallback(e);
							} else {
								resolveCallback({data: data});
							}
						});
					});
				});
		}

		/**
		 * Creates a filename that uses a folder.
		 *
		 * @static
		 * @public
		 * @param {...string|string[]} components
		 * @returns {string}
		 */
		static getQualifiedFilename() {
			const a = arguments;

			return Array.from(arguments).reduce((components, value) => {
				let next = [ ];

				if (is.array(value)) {
					next = value;
				} else if (is.string(value)) {
					next = [ value ];
				}

				return components.concat(
					next
						.join('/')
						.split(/[\\\/]/g)
						.filter((component) => {
							return is.string(component) && component.length > 0;
						})
				);
			}, [ ]).join('/');
		}

		_onDispose() {
			logger.debug('S3 provider disposed');
		}

		toString() {
			return '[S3Provider]';
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

	function getParameters(bucket, filename, additional) {
		return Object.assign(additional || { }, {
			Bucket: bucket,
			Key: S3Provider.getQualifiedFilename(filename)
		});
	}

	const contentHandlers = [ ];

	class ContentHandler {
		constructor() {

		}

		canProcess(mimeType) {
			return true;
		}

		toBuffer(content) {
			return Buffer.from(content);
		}

		fromBuffer(buffer) {
			return buffer;
		}

		static getHandlerFor(mimeType) {
			if (contentHandlers.length === 0) {
				contentHandlers.push(new JsonContentHandler());
				contentHandlers.push(new TextContentHandler());
				contentHandlers.push(new DefaultContentHandler());
			}

			return contentHandlers.find(handler => handler.canProcess(mimeType));
		}
	}

	class TextContentHandler extends ContentHandler {
		constructor() {
			super();
		}

		canProcess(mimeType) {
			return mimeType.startsWith('text');
		}

		toBuffer(content) {
			if (is.string(content)) {
				return Buffer.from(content, encodingTypes.utf8);
			} else {
				return Buffer.from(content);
			}
		}

		fromBuffer(buffer) {
			return buffer.toString(encodingTypes.utf8);
		}
	}

	class JsonContentHandler extends TextContentHandler {
		constructor() {
			super();
		}

		canProcess(mimeType) {
			return mimeType === mimeTypes.json;
		}

		toBuffer(content) {
			if (is.object(content)) {
				return super.toBuffer(JSON.stringify(content));
			} else {
				return super.toBuffer(content);
			}
		}

		fromBuffer(buffer) {
			return JSON.parse(super.fromBuffer(buffer));
		}
	}

	class DefaultContentHandler extends ContentHandler {
		constructor() {
			super();
		}
	}

	return S3Provider;
})();

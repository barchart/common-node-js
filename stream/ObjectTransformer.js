const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is'),
	promise = require('common/lang/promise');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/stream/ObjectTransformer');

	class ObjectTransformer extends Stream.Transform {
		constructor(transformations, description, silent) {
			super({ objectMode: true });

			this._tranformations = transformations;
			this._description = description;

			this._silent = is.boolean(silent) && silent;

			this._processor;

			if (transformations.every(t => t.synchronous)) {
				this._processor = processSynchronous.bind(this);
			} else {
				this._processor = processSynchronous.bind(this);
			}

			this._counter = 0;
		}

		_transform(chunk, encoding, callback) {
			this._processor(chunk, callback);
		}

		toString() {
			return '[ObjectTransformer]';
		}
	}

	function processSynchronous(chunk, callback) {
		this._counter = this._counter + 1;

		let error = null;
		let transformed = chunk;

		if (is.object(chunk)) {
			this._transforms.every((chunk, transformation) => {
				try {
					transformed = transformation(transformed);
				} catch (e) {
					error = e;
				}

				return error === null;
			});
		} else {
			error = new Error(`Transformation [ ${this._counter} ] for [ ${this._description} ] failed, unexpected input type.`);
		}

		if (error === null) {
			callback(null, transformed);
		} else {
			if (this._silent) {
				logger.warn(`Transformation [ ${this._counter} ] for [ ${this._description} ] failed.`);

				if (logger.isTraceEnabled() && chunk) {
					logger.trace(chunk);
				}

				error = null;
			}

			callback(error, null);
		}
	}

	function processAsynchronous(chunk, callback) {
		return promise.pipeline(this._tranformations.map(t => t.transform), chunk)
			.then((transformed) => {
				callback(null, transformed);
			}).catch((e) => {
				let error;

				if (this._silent) {
					logger.warn(`Transformation [ ${this._counter} ] for [ ${this._description} ] failed.`);

					if (logger.isTraceEnabled() && chunk) {
						logger.trace(chunk);
					}

					error = null;
				} else {
					error = e;
				}

				callback(error, null);
			});
	}

	return ObjectTransformer;
})();
const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is'),
	promise = require('common/lang/promise');

const Transformation = require('./transformations/Transformation');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/stream/ObjectTransformer');

	class ObjectTransformer extends Stream.Transform {
		/***
		 * @param {Array<Transformation>} transformations
		 * @param {String=} description
		 * @param {Boolean=} silent
		 */
		constructor(transformations, description, silent) {
			super({ objectMode: true });


			assert.argumentIsArray(transformations, 'transformations', Transformation);
			assert.argumentIsOptional(description, 'description', String);
			assert.argumentIsOptional(silent, 'silent', Boolean);

			this._tranformations = transformations;

			this._description = description || 'Object Transformer';
			this._silent = is.boolean(silent) && silent;

			let delegate;

			if (transformations.every(t => t.synchronous)) {
				delegate = processSynchronous.bind(this);
			} else {
				delegate = processSynchronous.bind(this);
			}

			this._delegate = delegate;

			this._counter = 0;
		}

		_transform(chunk, encoding, callback) {
			this._delegate(chunk, callback);
		}

		/**
		 * @param {Transformation}
		 * @returns {ObjectTransformer}
		 */
		addTransformation(transformation) {
			assert.argumentIsRequired(transformation, 'transformation', Transformation, 'Transformation');

			return new ObjectTransformer(this._tranformations.concat([ transformation ]), this._description, this._silent);
		}
		
		static define(description, silent) {
			return new ObjectTransformer([ ], description, silent);
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
			this._tranformations.every((t) => {
				try {
					transformed = t.transform(chunk);
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
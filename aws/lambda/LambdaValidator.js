const is = require('@barchart/common-js/lang/is');

const LambdaTriggerType = require('./LambdaTriggerType');

module.exports = (() => {
	'use strict';

	/**
	 * Evaluates a Lambda event, checking the messages it contains to determine
	 * which are valid for processing.
	 *
	 * @public
	 */
	class LambdaValidator {
		constructor() {
		}

		/**
		 * Checks messages contained within a Lambda event for validity.
		 *
		 * @public
		 * @param {Object} event
		 * @return {Promise<LambdaMessage[]>}
		 */
		validate(event) {
			return Promise.resolve()
				.then(() => {
					let messages;

					if (is.array(event.Records)) {
						messages = event.Records;
					} else {
						messages = [ event ];
					}
					
					return Promise.all(messages.map((message) => {
						const result = { };
						
						result.type = LambdaTriggerType.fromMessage(message);

						if (result.type !== null) {
							result.id = result.type.getId(message);
						} else {
							result.id = null;
						}
						
						result.message = message;

						let validatePromise;
						
						if (result.type !== null && result.id !== null) {
							validatePromise = Promise.resolve(this._validate(process.env.AWS_LAMBDA_FUNCTION_NAME, result.type, result.id));
						} else {
							validatePromise = Promise.resolve(true);
						}
						
						return validatePromise.then((valid) => {
							result.valid = valid;
							
							return result;
						});
					}));
				});
		}

		/**
		 * @protected
		 * @param {String} name
		 * @param {LambdaTriggerType} type
		 * @param {String} id
		 * @returns {Boolean|Promise<Boolean>}
		 */
		_validate(name, type, id) {
			return true;
		}
		
		toString() {
			return '[LambdaValidator]';
		}
	}

	/**
	 * Data regarding a single Lambda function invocation
	 *
	 * @typedef LambdaMessage
	 * @type {Object}
	 * @property {LambdaTriggerType|null} type
	 * @property {String|null} id 
	 * @property {Object} message
	 * @property {Boolean} valid
	 */
	
	return LambdaValidator;
})();
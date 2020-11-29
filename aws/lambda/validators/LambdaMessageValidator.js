const assert = require('@barchart/common-js/lang/assert');

const LambdaTriggerType = require('./../LambdaTriggerType');

module.exports = (() => {
	'use strict';

	/**
	 * Validates a "message" contained within an AWS Lambda event (some
	 * events include multiple messages).
	 *
	 * @public
	 * @abstract
	 */
	class LambdaMessageValidator {
		constructor() {

		}

		/**
		 * Validates a message.
		 *
		 * @public
		 * @param {String} name
		 * @param {Object} message
		 * @param {Object} event
		 * @param {String=} messageId
		 * @param {LambdaTriggerType=} trigger
		 * @returns {Promise<Boolean>}
		 */
		validate(name, message, event, messageId, trigger) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsOptional(messageId, 'messageId', String);
					assert.argumentIsOptional(trigger, 'trigger', LambdaTriggerType, 'LambdaTriggerType');

					return this._validate(name, message, event, messageId, trigger);
				});
		}

		/**
		 * @protected
		 * @abstract
		 * @param {String} name
		 * @param {Object} message
		 * @param {Object} event
		 * @param {String=} messageId
		 * @param {LambdaTriggerType=} trigger
		 * @returns {Promise<Boolean>|Boolean}
		 */
		_validate(name, message, event, messageId, trigger) {
			return true;
		}

		toString() {
			return '[LambdaMessageValidator]';
		}
	}

	return LambdaMessageValidator;
})();

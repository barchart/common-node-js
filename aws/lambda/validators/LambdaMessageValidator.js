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
		 * @param {LambdaTriggerType=} trigger
		 * @param {String=} messageId
		 * @returns {Promise<Boolean>}
		 */
		validate(name, message, event, trigger, messageId) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsOptional(trigger, 'trigger', LambdaTriggerType, 'LambdaTriggerType');
					assert.argumentIsOptional(messageId, 'messageId', String);

					return this._validate(name, message, event, trigger, messageId);
				});
		}

		/**
		 * @protected
		 * @abstract
		 * @param {String} name
		 * @param {Object} message
		 * @param {Object} event
		 * @param {LambdaTriggerType=} trigger
		 * @param {String=} messageId
		 * @returns {Promise<Boolean>|Boolean}
		 */
		_validate(name, message, event, trigger, messageId) {
			return true;
		}

		toString() {
			return '[LambdaMessageValidator]';
		}
	}

	return LambdaMessageValidator;
})();

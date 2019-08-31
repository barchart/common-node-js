const Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * An enumeration for different Lambda event triggers.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {Boolean} multiple
	 * @param {Function} matchPredicate
	 * @param {Function} schemaExtractor
	 */
	class LambdaTriggerType extends Enum {
		constructor(code, multiple, matchPredicate, idExtractor) {
			super(code, code);

			this._multiple = multiple;

			this._matchPredicate = matchPredicate;
			this._idExtractor = idExtractor;
		}

		/**
		 * Indicates if the invocation type can contain more than one triggering
		 * message (i.e. an array of messages).
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get multiple() {
			return this._multiple;
		}

		/**
		 * A function, accepting a trigger message, which returns true if the message
		 * matches the current {@link LambdaTriggerType}.
		 *
		 * @public
		 * @returns {Function}
		 */
		get matchPredicate() {
			return this._matchPredicate;
		}

		/**
		 * A function, accepting a trigger message, which returns the message's unique identifier.
		 *
		 * @public
		 * @returns {Function}
		 */
		get idExtractor() {
			return this._idExtractor;
		}

		/**
		 * Given a message, returns the {@LambdaTriggerType} which matches the message.
		 *
		 * @public
		 * @static
		 * @param {Object} message
		 * @returns {LambdaTriggerType|null}
		 */
		static fromMessage(message) {
			return Enum.getItems(LambdaTriggerType).find(t => t.matchPredicate(message)) || null;
		}

		/**
		 * Given a message, returns the message's unique identifier.
		 *
		 * @public
		 * @static
		 * @param {Object} message
		 * @returns {String|null}
		 */
		static getIdentifier(message) {
			const type = LambdaTriggerType.fromMessage(message);

			let identifier;

			if (type !== null) {
				identifier = type.idExtractor(message);
			} else {
				identifier = null;
			}

			return identifier;
		}

		/**
		 * A CloudWatch events trigger.
		 *
		 * @public
		 * @static
		 * @returns {LambdaTriggerType}
		 */
		static get CLOUDWATCH() {
			return cloudwatch;
		}

		/**
		 * A Dynamo stream.
		 *
		 * @public
		 * @static
		 * @returns {LambdaTriggerType}
		 */
		static get DYNAMO() {
			return dynamo;
		}

		/**
		 * A SNS message.
		 *
		 * @public
		 * @static
		 * @returns {LambdaTriggerType}
		 */
		static get SNS() {
			return sns;
		}

		/**
		 * A SQS message.
		 *
		 * @public
		 * @static
		 * @returns {LambdaTriggerType}
		 */
		static get SQS() {
			return sqs;
		}

		toString() {
			return `[LambdaTriggerType (code=${this.code})]`;
		}
	}

	const cloudwatch = new LambdaTriggerType('CRON', false, e => e.source === 'aws.events', e => e.id);
	const dynamo = new LambdaTriggerType('DYNAMO', true, e => e.eventSource === 'aws:dynamodb', e => e.eventID);
	const sns = new LambdaTriggerType('SNS', true, e => e.EventSource === 'aws:sns', e => e.MessageId);
	const sqs = new LambdaTriggerType('SQS', true, e => e.eventSource === 'aws:sqs', e => e.messageId);

	return LambdaTriggerType;
})();

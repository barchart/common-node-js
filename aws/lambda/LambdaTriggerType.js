const Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * An enumeration for different Lambda event triggers.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {String} schemaName
	 * @param {Function} schemaExtractor
	 */
	class LambdaTriggerType extends Enum {
		constructor(code, schemaName, schemaExtractor) {
			super(code, code);

			this._schemaName = schemaName;
			this._schemaExtractor = schemaExtractor;
		}

		/**
		 * The string used to describe in the invocation type in a
		 * Lambda event.
		 *
		 * @public
		 * @returns {String}
		 */
		getSchemaName() {
			return this._schemaName;
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

	const cloudwatch = new LambdaTriggerType('CRON', 'aws.events', e => e.source);
	const dynamo = new LambdaTriggerType('DYNAMO', 'aws:dynamodb', e => e.eventSource);
	const sns = new LambdaTriggerType('SNS', 'aws:sns', e => e.EventSource);
	const sqs = new LambdaTriggerType('SQS', 'aws:sqs',  e => e.eventSource);

	return LambdaTriggerType;
})();

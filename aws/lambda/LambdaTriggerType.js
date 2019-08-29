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
	 */
	class LambdaTriggerType extends Enum {
		constructor(code, schemaName) {
			super(code, code);

			this._schemaName = schemaName;
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

	const cloudwatch = new LambdaTriggerType('CRON', '');
	const dynamo = new LambdaTriggerType('DYNAMO', '');
	const sns = new LambdaTriggerType('SNS', '');
	const sqs = new LambdaTriggerType('SQS', '');

	return LambdaTriggerType;
})();

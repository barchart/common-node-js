const Attribute = require('./../../schema/definitions/Attribute'),
	Expression = require('./Expression'),
	UpdateActionType = require('./UpdateActionType'),
	UpdateOperatorType = require('./UpdateOperatorType');

module.exports = (() => {
	'use strict';

	class UpdateExpression extends Expression {
		constructor(actionType, attribute, operatorType, operand) {
			super(attribute, operatorType, operand);

			this._actionType = actionType;
		}

		/**
		 * Type of update action.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		get actionType() {
			return this._actionType;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (!(this._actionType instanceof UpdateActionType)) {
				throw new Error('ActionType data type is invalid.');
			}

			if (!(this._attribute instanceof Attribute)) {
				throw new Error('Attribute data type is invalid.');
			}

			if (!(this._operatorType instanceof UpdateOperatorType)) {
				throw new Error('OperatorType data type is invalid.');
			}
		}

		toString() {
			return `[UpdateExpression]`;
		}
	}

	return UpdateExpression;
})();

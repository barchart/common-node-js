const Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * Defines update action types for UpdateItem operation.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {String} description
	 * @param {String} keyword
	 */
	class UpdateActionType extends Enum {
		constructor(code, description, keyword) {
			super(code, description, keyword);

			this._keyword = keyword;
		}

		/**
		 * Keyword for action to be used in DyanmoDB query language.
		 *
		 * @public
		 * @returns {String}
		 */
		get keyword() {
			return this._keyword;
		}

		/**
		 * Add.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get ADD() {
			return add;
		}

		/**
		 * Delete.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get DELETE() {
			return del;
		}

		/**
		 * Set.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get SET() {
			return set;
		}

		/**
		 * Remove.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get REMOVE() {
			return remove;
		}

		toString() {
			return `[UpdateActionType (code=${this.code}, description=${this.description})]`;
		}
	}

	const add = new UpdateActionType('add', 'add', 'ADD');
	const del = new UpdateActionType('delete', 'delete', 'DELETE');
	const set = new UpdateActionType('set', 'set', 'SET');
	const remove = new UpdateActionType('remove', 'remove', 'REMOVE');

	return UpdateActionType;
})();

const assert = require('common/lang/assert');

const DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	/**
	 * A {@link Component} aggregates several fields, this instance describes
	 * a single field used within a {@link Component}
	 *
	 * @public
	 * @param {DataType} - The field's {@link DataType}.
	 * @param {String} - The suffix to use when generating a field name.
	 * @param {String=} - The suffix to use when geneating a field alias.
	 */
	class ComponentTypeDefinition {
		constructor(dataType, suffix, alias) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');
			assert.argumentIsRequired(suffix, 'suffix', String);
			assert.argumentIsRequired(alias, 'alias', String);

			this._dataType = dataType;
			this._suffix = suffix;
			this._alias = alias || suffix;
		}

		/**
		 * The field's data type.
		 *
		 * @returns {DataType}
		 */
		get dataType() {
			return this._dataType;
		}

		/**
		 * The field's suffix.
		 *
		 * @returns {String}
		 */
		get suffix() {
			return this._suffix;
		}

		/**
		 * The field's suffix (for a field alias).
		 *
		 * @returns {String}
		 */
		get alias() {
			return this._alias;
		}

		/**
		 * Generates a field name.
		 *
		 * @public
		 * @param {String} componentName - The name of the {@link Component}. See {@link Component#name}.
		 * @returns {String}
		 */
		getFieldName(componentName) {
			return `${componentName}-${this._suffix}`;
		}

		/**
		 * Generates a field alias.
		 *
		 * @public
		 * @param {String} componentName - The name of the {@link Component}. See {@link Component#alias}.
		 * @returns {String}
		 */
		getFieldAlias(componentAlias) {
			return `${componentAlias}-${this._alias}`;
		}

		toString() {
			return `[ComponentTypeDefinition]`;
		}
	}

	return ComponentTypeDefinition;
})();
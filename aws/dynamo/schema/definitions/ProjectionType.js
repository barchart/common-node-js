const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	class ProjectionType {
		constructor(code, description) {
			assert.argumentIsRequired(code, 'code', String);
			assert.argumentIsRequired(description, 'description', String);

			this._code = code;
			this._description = description;
		}

		get code() {
			return this._code;
		}

		get description() {
			return this._description;
		}

		get custom() {
			return this.code === ProjectionType.CUSTOM.code;
		}

		static get ALL() {
			return projectionTypeAll;
		}

		static get KEYS() {
			return projectionTypeKeys;
		}

		static get CUSTOM() {
			return projectionTypeCustom;
		}

		static fromCode(code) {
			assert.argumentIsRequired(code, 'code', String);

			return projectionTypes.find(pt => pt.code === code);
		}

		toString() {
			return `[ProjectionType (code=${this._code}, description=${this._description})]`;
		}
	}

	const projectionTypeAll = new ProjectionType('ALL', 'All');
	const projectionTypeKeys = new ProjectionType('KEYS_ONLY', 'Keys');
	const projectionTypeCustom = new ProjectionType('INCLUDE', 'Custom');

	const projectionTypes = [ projectionTypeAll, projectionTypeKeys, projectionTypeCustom ];

	return ProjectionType;
})();
const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * Specifies the streaming behavior of a DynamoDB table.
	 *
	 * @public
	 */
	class StreamViewType {
		constructor(description, schemaName) {
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsRequired(schemaName, 'schemaName', String);

			this._description = description;
			this._schemaName = schemaName;
		}

		/**
		 * @returns {String}
		 */
		get description() {
			return this._description;
		}

		/**
		 * @returns {String}
		 */
		get schemaName() {
			return this._schemaName;
		}

		/**
		 * @returns {StreamViewType}
		 */
		static get NEW_IMAGE() {
			return streamTypeNewImage;
		}

		/**
		 * @returns {StreamViewType}
		 */
		static get OLD_IMAGE() {
			return streamTypeOldImage;
		}

		/**
		 * @returns {StreamViewType}
		 */
		static get BOTH_IMAGES() {
			return streamTypeBothImages;
		}

		/**
		 * @returns {StreamViewType}
		 */
		static get KEYS_ONLY() {
			return streamTypeKeysOnly;
		}

		/**
		 * @param {String} code
		 * @returns {StreamViewType}
		 */
		static fromCode(code) {
			assert.argumentIsRequired(code, 'code', String);

			return streamTypes.find(it => it.code === code);
		}

		toString() {
			return `[StreamViewType (description=${this._description})]`;
		}
	}

	const streamTypeNewImage = new StreamViewType('New Image', 'NEW_IMAGE');
	const streamTypeOldImage = new StreamViewType('Old Image', 'OLD_IMAGE');
	const streamTypeBothImages = new StreamViewType('Both Images', 'NEW_AND_OLD_IMAGES');
	const streamTypeKeysOnly = new StreamViewType('Keys Only', 'KEYS_ONLY');

	const streamTypes = [ streamTypeNewImage, streamTypeOldImage, streamTypeBothImages, streamTypeKeysOnly ];

	return StreamViewType;
})();
const assert = require('@barchart/common-js/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	DataType = require('./../definitions/DataType');

const DerivationBuilder = require('./DerivationBuilder'),
	EncryptorBuilder = require('./EncryptorBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building an {@link Attribute}.
	 *
	 * @public
	 * @param {String} name
	 */
	class AttributeBuilder {
		constructor(name, parent) {
			assert.argumentIsRequired(name, 'name', String);

			this._attribute = new Attribute(name);
			this._parent = parent;
		}

		/**
		 * The {@link Attribute}, given all the information provided thus far.
		 *
		 * @public
		 * @returns {Attribute}
		 */
		get attribute() {
			return this._attribute;
		}

		/**
		 * Set the {@link DataType} and returns the current instance.
		 *
		 * @public
		 * @param {DataType} dataType
		 * @returns {AttributeBuilder}
		 */
		withDataType(dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			this._attribute = new Attribute(this._attribute.name, dataType, this._attribute.derivation, this._attribute.encryptor);

			return this;
		}

		/**
		 * Sets a strategy for the framework to compose the {@link Attribute} value from
		 * other fields.
		 *
		 * @param {Function} callback - Synchronously called, providing a {@link DerivationBuilder} tied to the current instance.
		 * @returns {AttributeBuilder}
		 */
		withDerivationBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const derivationBuilder = new DerivationBuilder(this._parent);

			callback(derivationBuilder);

			const derivation = derivationBuilder.derivation;

			this._attribute = new Attribute(this._attribute.name, this._attribute.dataType, derivation, this._attribute.encryptor);

			return this;
		}

		/**
		 * Sets the encryption strategy for the field.
		 *
		 * @param {EncryptionType} encryptionType
		 * @param {String} password
		 * @returns {AttributeBuilder}
		 */
		withEncryptor(encryptionType, password) {
			this.withEncryptorBuilder((eb) => {
				eb.withEncryptionType(encryptionType)
					.withPassword(password);
			});
			
			return this;
		}
		
		/**
		 * Sets the encryption strategy for the field, using an {@link EncryptorBuilder} provided via callback.
		 *
		 * @param {Function} callback - Synchronously called, providing a {@link EncryptorBuilder} tied to the current instance.
		 * @returns {AttributeBuilder}
		 */
		withEncryptorBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const encryptorBuilder = new EncryptorBuilder();

			callback(encryptorBuilder);

			const encryptor = encryptorBuilder.encryptor;

			this._attribute = new Attribute(this._attribute.name, this._attribute.dataType, this._attribute.derivation, encryptor);

			return this;
		}

		toString() {
			return '[AttributeBuilder]';
		}
	}

	return AttributeBuilder;
})();
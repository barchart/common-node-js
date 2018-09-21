const assert = require('@barchart/common-js/lang/assert'),
	attributes = require('@barchart/common-js/lang/attributes'),
	is = require('@barchart/common-js/lang/is');

const Attribute = require('./../../definitions/Attribute'),
	Serializers = require('./../Serializers');

const Writer = require('./Writer');

module.exports = (() => {
	'use strict';

	/**
	 * Reads an attribute value from a source object and writes it to
	 * a target object, in the form required for saving to DynamoDB.
	 *
	 * @public
	 * @extends {Writer}
	 * @param {Attribute} attribute
	 */
	class AttributeSerializationWriter extends Writer {
		constructor(attribute) {
			super();

			assert.argumentIsRequired(attribute, 'attribute', Attribute, 'Attribute');

			this._attribute = attribute;
			this._serializer = Serializers.forAttribute(attribute);

			let existsDelegate;
			let readDelegate;

			if (this._attribute.derivation === null) {
				const attributeDelegates = getDelegatesForAttribute(this._attribute);

				existsDelegate = attributeDelegates.exists;
				readDelegate = attributeDelegates.read;
			} else {
				const derivation = this._attribute.derivation;

				const derivationDelegates = derivation.attributes.map(a => getDelegatesForAttribute(a));

				existsDelegate = source => derivationDelegates.every(dd => dd.exists(source));
				readDelegate = source => derivation.generator(derivationDelegates.map(dd => dd.read(source)));
			}

			this._existsDelegate = existsDelegate;
			this._readDelegate = readDelegate;
		}

		_write(source, target) {
			const name = this._attribute.name;

			target[name] = this._serializer.serialize(this._readDelegate(source));
		}

		_canWrite(source, target) {
			return this._serializer !== null && is.object(source) && this._existsDelegate(source);
		}

		toString() {
			return '[AttributeSerializationWriter]';
		}
	}

	function getDelegatesForAttribute(attribute) {
		let existsDelegate;
		let readDelegate;

		if (attribute.name.includes(Writer.SEPARATOR)) {
			const names = attribute.name.split(Writer.SEPARATOR);

			existsDelegate = source => attributes.has(source, names);
			readDelegate = source => attributes.read(source, names);
		} else {
			const name = attribute.name;

			existsDelegate = source => source.hasOwnProperty(name);
			readDelegate = source => source[name];
		}

		return {
			exists: existsDelegate,
			read: readDelegate
		};
	}

	return AttributeSerializationWriter;
})();
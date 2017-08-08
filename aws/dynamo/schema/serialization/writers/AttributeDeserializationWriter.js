const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const Attribute = require('./../../definitions/Attribute'),
	Serializers = require('./../Serializers');

const Writer = require('./Writer');

module.exports = (() => {
	'use strict';

	class AttributeDeserializationWriter extends Writer {
		constructor(attribute) {
			super();

			assert.argumentIsRequired(attribute, 'attribute', Attribute, 'Attribute');

			this._attribute = attribute;
			this._serializer = Serializers.forAttribute(attribute);

			let writeDelegate;

			if (this._attribute.name.includes(Writer.SEPARATOR)) {
				const names = this._attribute.split(Writer.SEPARATOR);

				writeDelegate = (target, value) => attributes.write(target, names, value);
			} else {
				writeDelegate = (target, value) => target[name] = value;
			}

			this._writeDelegate = writeDelegate;
		}

		_write(source, target) {
			this._writeDelegate(target, this._serializer.deserialize(source[this._attribute.name]));
		}

		_canWrite(source, target) {
			return this._serializer !== null && is.object(source) && source.hasOwnProperty(this._attribute.name);
		}

		toString() {
			return '[AttributeDeserializationWriter]';
		}
	}

	return Writer;
})();
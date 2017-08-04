const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./../../definitions/Attribute'),
	Serializers = require('./../Serializers');

const Writer = require('./Writer');

module.exports = (() => {
	'use strict';

	class AttributeSerializationWriter extends Writer {
		constructor(attribute) {
			super();

			assert.argumentIsRequired(attribute, 'attribute', Attribute, 'Attribute');

			this._attribute = attribute;
			this._serializer = Serializers.forAttribute(attribute);
		}

		_write(source, target) {
			const name = this._attribute.name;

			target[name] = this._serializer.serialize(source[name]);
		}

		_canWrite(source, target) {
			return this._serializer !== null && is.object(source) && source.hasOwnProperty(this._attribute.name);
		}

		toString() {
			return '[AttributeSerializationWriter]';
		}
	}

	return AttributeSerializationWriter;
})();
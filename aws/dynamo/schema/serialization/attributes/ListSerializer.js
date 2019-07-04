const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const AttributeSerializer = require('./AttributeSerializer'),
	DataType = require('./../../definitions/DataType'),
	Serializers = require('./../Serializers');

module.exports = (() => {
	'use strict';

	const SUPPORTED_DATA_TYPES = [
		{
			type: DataType.BOOLEAN,
			is: (value) => is.boolean(value),
		},
		{
			type: DataType.NUMBER,
			is: (value) => is.number(value),
		},
		{
			type: DataType.STRING,
			is: (value) => is.string(value),
		},
	];

	/**
	 * Converts a list into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @public
	 * @extends {AttributeSerializer}
	 */
	class ListSerializer extends AttributeSerializer {
		constructor() {
			super();
		}

		serialize(list) {
			assert.argumentIsArray(list, 'list');

			const wrapper = { };

			const serialized = list.reduce((acc, item) => {
				const dt = SUPPORTED_DATA_TYPES.find((sdt) => sdt.is(item));

				if (!dt.type) {
					throw new Error(`Failed to serialize list item. Provided type for [ ${item} ] is not supported.`);
				}

				const serializer = Serializers.forDataType(dt.type);

				acc.push(serializer.serialize(item));

				return acc;
			}, [ ]);

			wrapper[DataType.LIST.code] = serialized;

			return wrapper;
		}

		deserialize(wrapper) {
			const deserialized = wrapper[DataType.LIST.code];

			return deserialized.reduce((acc, item) => {
				const dt = SUPPORTED_DATA_TYPES.find((sdt) => !is.undefined(item[sdt.type.code]));

				if (!dt.type) {
					throw new Error(`Failed to deserialize list item. Provided type for [ ${item} ] is not supported.`);
				}

				const serializer = Serializers.forDataType(dt.type);

				acc.push(serializer.deserialize(item));

				return acc;
			}, [ ]);
		}

		/**
		 * A singleton.
		 *
		 * @public
		 * @static
		 * @returns {ListSerializer}
		 */
		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[ListSerializer]';
		}
	}

	const instance = new ListSerializer();

	return ListSerializer;
})();

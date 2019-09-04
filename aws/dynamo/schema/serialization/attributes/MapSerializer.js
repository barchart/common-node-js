const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const AttributeSerializer = require('./AttributeSerializer'),
	BooleanSerializer = require('./BooleanSerializer'),
	NumberSerializer = require('./NumberSerializer'),
	StringSerializer = require('./StringSerializer');

const DataType = require('./../../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a map into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @public
	 * @extends {AttributeSerializer}
	 */
	class MapSerializer extends AttributeSerializer {
		constructor() {
			super();
		}

		serialize(map) {
			assert.argumentIsRequired(map, 'map', Object);

			const wrapper = { };
			const serialized = { };

			Object.keys(map).forEach((key) => {
				const dt = SUPPORTED_DATA_TYPES.find((sdt) => sdt.is(map[key]));

				if (!dt) {
					throw new Error(`Failed to serialize list item. Provided type for [ ${map[key]} ] is not supported.`);
				}

				serialized[key] = dt.serializer.serialize(map[key]);
			});

			wrapper[DataType.MAP.code] = serialized;

			return wrapper;
		}

		deserialize(wrapper) {
			const deserialized = { };

			const map = wrapper[DataType.MAP.code];

			Object.keys(map).forEach((key) => {
				const dt = SUPPORTED_DATA_TYPES.find((sdt) => !is.undefined(map[key][sdt.type.code]));

				if (!dt) {
					throw new Error(`Failed to deserialize list item. Provided type for [ ${map[key]} ] is not supported.`);
				}

				deserialized[key] = dt.serializer.deserialize(map[key]);
			});

			return deserialized;
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[MapSerializer]';
		}
	}

	const instance = new MapSerializer();

	const SUPPORTED_DATA_TYPES = [
		{
			type: DataType.BOOLEAN,
			is: (value) => is.boolean(value),
			serializer: BooleanSerializer.INSTANCE,
		},
		{
			type: DataType.NUMBER,
			is: (value) => is.number(value),
			serializer: NumberSerializer.INSTANCE,
		},
		{
			type: DataType.STRING,
			is: (value) => is.string(value),
			serializer: StringSerializer.INSTANCE,
		},
	];

	return MapSerializer;
})();

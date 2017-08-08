const assert = require('common/lang/assert'),
	Money = require('common/lang/Money');

const ComponentSerializer = require('./ComponentSerializer'),
	ComponentType = require('./../../definitions/ComponentType');

module.exports = (() => {
	'use strict';

	/**
	 * A component serializer for {@link Money} instances.
	 */
	class MoneySerializer extends ComponentSerializer {
		constructor() {
			super(ComponentType.MONEY);
		}

		_readComponent(object) {
			assert.argumentIsRequired(object, 'object', Money, 'Money');

			return [
				object.decimal,
				object.currency
			];
		}

		_createComponent(data) {
			return new Money(data[0], data[1]);
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[MoneySerializer]';
		}
	}

	const instance = new MoneySerializer();

	return MoneySerializer;
})();
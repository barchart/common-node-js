const assert = require('common/lang/assert'),
	Money = require('common/lang/Money');

const ComponentSerializer = require('./ComponentSerializer'),
	ComponentType = require('./../../definitions/ComponentType');

module.exports = (() => {
	'use strict';

	class MoneySerializer extends ComponentSerializer {
		constructor() {
			super();
		}

		get componentType() {
			return ComponentType.MONEY;
		}

		_readComponent(object) {
			assert.argumentIsRequired(object, 'object', Money, 'Money');

			return [
				object.decimal.toFixed(),
				object.currency
			];
		}

		_createComponent(data) {
			return new Money(data[0], data[1]);
		}

		toString() {
			return '[MoneySerializer]';
		}
	}

	return MoneySerializer;
})();
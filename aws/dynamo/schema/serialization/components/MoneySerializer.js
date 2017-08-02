const assert = require('common/lang/assert');

const ComponentType = require('./../../definitions/ComponentType');

module.exports = (() => {
	'use strict';
	
	class MoneySerializer {
		constructor() {

		}

		get componentType() {
			return ComponentType.MONEY;
		}

		serialize(component, source, target) {
			const amountField = component.componentType.getDefinition('amount').getFieldName(component.name);
			const currencyField = component.componentType.getDefinition('currency').getFieldName(component.name);


		}

		deserialize(component, source, target) {
			const amountField = component.componentType.getDefinition('amount').getFieldName(component.name);
			const currencyField = component.componentType.getDefinition('currency').getFieldName(component.name);


		}

		toString() {
			return '[MoneySerializer]';
		}
	}

	return MoneySerializer;
})();
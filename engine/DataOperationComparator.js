const comparators = require('@barchart/common-js/collections/sorting/comparators'),
	ComparatorBuilder = require('@barchart/common-js/collections/sorting/ComparatorBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * The comparator used to sort {@link DataOperation} instances in the 
	 * {@link DataSession} priority queue.
	 */
	class DataOperationComparator {
		constructor() {

		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[DataOperationComparator]';
		}
	}

	const instance = ComparatorBuilder.startWith((a, b) => comparators.compareNumbers(a.stage.priority, b.stage.priority))
		.thenBy((a, b) => comparators.compareNumbers(a.enqueueOrder, b.enqueueOrder))
		.toComparator();

	return DataOperationComparator;
})();

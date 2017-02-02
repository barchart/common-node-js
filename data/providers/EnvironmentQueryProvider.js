var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var Environment = require('./../../environment/Environment');
var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/EnvironmentQueryProvider');

	/**
	 * A {@link QueryProvider} query provider that returns one or
	 * more properties read from the {@link Environment} singleton.
	 *
	 * @public
	 * @extends QueryProvider
	 * @param {Object} configuration
	 * @param {string=} configuration.properties - A list of properties to read from the {@link Environment}.
	 * @param {string=} configuration.property - A single property to read from the {@link Environment}.
	 */
	class EnvironmentQueryProvider extends QueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_runQuery(criteria) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.array(configuration.properties)) {
				returnRef = configuration.properties.reduce((map, property) => {
					map[property] = attributes.read(Environment.getInstance().getConfiguration(), property);

					return map;
				}, {});
			} else if (is.string(configuration.property)) {
				returnRef = attributes.read(Environment.getInstance().getConfiguration(), configuration.property);
			} else {
				returnRef = undefined;
			}

			return returnRef;
		}

		toString() {
			return '[EnvironmentQueryProvider]';
		}
	}

	return EnvironmentQueryProvider;
})();
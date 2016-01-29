var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var QueryProvider = require('./../QueryProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/providers/ContextQueryProvider');

	var ContextQueryProvider = QueryProvider.extend({
		init: function (configuration) {
			this._super(configuration);
		},

		_runQuery: function (criteria) {
			var configuration = this._getConfiguration();

			var returnRef;

			if (_.isArray(configuration.properties)) {
				returnRef = _.reduce(configuration.properties, function (map, property) {
					map[property] = attributes.read(criteria, property);

					return map;
				}, {});
			} else if (_.isString(configuration.property)) {
				returnRef = attributes.read(criteria, configuration.property);
			} else {
				returnRef = undefined;
			}

			return returnRef;
		},

		toString: function () {
			return '[ContextQueryProvider]';
		}
	});

	return ContextQueryProvider;
}();
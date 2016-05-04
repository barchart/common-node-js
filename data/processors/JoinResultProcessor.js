var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/JoinResultProcessor');

	var JoinResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var that = this;

			var configuration = that._getConfiguration();

			var target = attributes.read(results, configuration.target);
			var source = attributes.read(results, configuration.source);

			var targetProperty;
			var sourceProperty;

			if (_.isString(configuration.targetProperty) && _.isString(configuration.sourceProperty)) {
				targetProperty = configuration.targetProperty;
				sourceProperty = configuration.sourceProperty;
			} else {
				targetProperty = configuration.join;
				sourceProperty = configuration.join;
			}

			var aliasProperty = configuration.alias;

			var sourceItemMap;

			if (_.isBoolean(configuration.multiple) && _.isBoolean(configuration.multiple)) {
				sourceItemMap = _.groupBy(source, sourceProperty);
			} else {
				sourceItemMap = _.indexBy(source, sourceProperty);
			}

			_.forEach(target, function(targetItem) {
				var targetValue;

				if (_.isArray(targetItem[targetProperty])) {
					var joinValues = targetItem[targetProperty];

					targetValue = _.map(joinValues, function(joinValue) {
						return sourceItemMap[joinValue];
					});
				} else {
					var joinValue = targetItem[targetProperty];

					targetValue = sourceItemMap[joinValue];
				}

				attributes.write(targetItem, aliasProperty, targetValue);
			});

			return target;
		},

		toString: function() {
			return '[JoinResultProcessor]';
		}
	});

	return JoinResultProcessor;
}();
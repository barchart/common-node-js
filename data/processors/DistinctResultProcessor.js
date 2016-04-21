var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/DistinctResultProcessor');

	var DistinctResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var configuration = this._getConfiguration();

			var returnRef;

			if (_.isString(configuration.property)) {
				var propertyName = configuration.property;

				var wrap;

				if (_.isBoolean(configuration.wrap)) {
					wrap = configuration.wrap;
				} else {
					wrap = true;
				}

				var items =
					_.unique(
						_.reduce(results, function(accumulator, result) {
							var value = attributes.read(result, propertyName);

							if (_.isArray(value)) {
								_.forEach(value, function(item) {
									accumulator.push(item);
								});
							} else {
								accumulator.push(value);
							}

							return accumulator;
						}, [ ])
					);

				if (wrap) {
					returnRef = _.map(items, function(item) {
						var wrapper = {};

						wrapper[propertyName] = item;

						return wrapper;
					});
				} else {
					returnRef = items;
				}
			} else {
				returnRef = results;
			}

			return returnRef;
		},

		toString: function() {
			return '[DistinctResultProcessor]';
		}
	});

	return DistinctResultProcessor;
}();
var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/WrapResultProcessor');

	var WrapResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var configuration = this._getConfiguration();

			var propertyName = configuration.propertyName;

			if (!_.isString(propertyName) || propertyName.length === 0) {
				return results;
			}

			var wrapArray = _.isBoolean(configuration.wrapArray) && configuration.wrapArray;

			var returnRef;

			if (_.isArray(results) && wrapArray) {
				returnRef = _.map(results, function(item) {
					return wrap(propertyName, item);
				});
			} else {
				returnRef = wrap(propertyName, results);
			}

			return returnRef;
		},

		toString: function() {
			return '[WrapResultProcessor]';
		}
	});

	function wrap(propertyName, item) {
		var returnRef = { };

		attributes.write(returnRef, propertyName, item);

		return returnRef;
	}

	return WrapResultProcessor;
}();
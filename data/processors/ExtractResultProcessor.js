var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/ExtractResultProcessor');

	var ExtractResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var that = this;

			if (_.isUndefined(results) || _.isNull(results)) {
				return [];
			}

			if (!_.isArray(results)) {
				throw new Error('Unable to extract results, input must be an array.');
			}

			var configuration = that._getConfiguration();
			var propertyName = configuration.propertyName;

			if (!_.isString(propertyName) || propertyName.length === 0) {
				return results;
			}

			return _.map(results, function(item) {
				return attributes.read(item, propertyName);
			});
		},

		toString: function() {
			return '[ExtractResultProcessor]';
		}
	});

	return ExtractResultProcessor;
}();